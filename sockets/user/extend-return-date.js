const { MailConstructor } = require("../../utils/templateMails");
const { queueMail } = require("../../utils/queueMail.js");
const { toTitleCase } = require("../../utils/toTitleCase.js");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, email_queue) => {
    socket.on("extend-return-date", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.return_date) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let return_date_epoch = new Date(data.return_date).getTime() / 1000;
        let time_now_epoch = Date.now() / 1000;

        // Reject the return date if it is in the past
        if(return_date_epoch < time_now_epoch) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        // Reject the return date if it is further than three months
        if(return_date_epoch > (time_now_epoch + 7889231)) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let should_send_mail = true;
        // Due book notice email should be sent out two weeks before return date
        let send_mail_time = return_date_epoch - 1209600;

        // However, if the two weeks notice would be sent in the past, don't send it all
        // (The student should be aware that their book is due soon anyways)
        if(send_mail_time < time_now_epoch) should_send_mail = false;

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();

        // Confirm the book a) exists, b) is checked out, c) and is checked out by the person who originated the request
        if(book.exists && book.data().available == false && book.data().holder == data.username){
            books.doc(book.data().isbn).update({
                return_date: return_date_epoch
            });

            let mail_db_ref = await email_queue.doc(book.data().isbn);
            let mail_db = await mail_db_ref.get();

            // If the mail exists in the database already..
            if(mail_db.exists){
                // and we should send a two week notice mail..
                if(should_send_mail){
                    // Update the mail in the database with the new date
                    const mail_constructor = new MailConstructor(data.username, send_mail_time);
                    let date = new Date(return_date_epoch * 1000);
                    let mail = mail_constructor.constructMail("book_due", toTitleCase(book.data().title), `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`);
                    queueMail(book.data().isbn, mail, email_queue);
                }else{
                    // and we shouldn't send a two week notice mail..
                    // delete the mail in the database
                    const res = await mail_db_ref.delete();
                }
            }else{
                // If the mail doesn't exist in the database already..
                // and we should send a two week notice mail..
                if(should_send_mail){
                    // Construct a new mail template and queue it
                    let mail_constructor = new MailConstructor(data.username, send_mail_time);
                    let date = new Date(return_date_epoch * 1000);
                    let mail = mail_constructor.constructMail("book_due", toTitleCase(book.data().title), `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`);
                    queueMail(book.data().isbn, mail, email_queue);
                }
            }

            socket.emit("modify-results", {message: "Return date was updated!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }else{
            socket.emit("modify-results", {message: "Could not update return date.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}