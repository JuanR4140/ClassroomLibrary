const { MailConstructor } = require("../../utils/templateMails.js");
const { queueMail } = require("../../utils/queueMail.js");
const { toTitleCase } = require("../../utils/toTitleCase.js");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, email_queue) => {
    socket.on("check-out", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.return_date) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let return_date_epoch = new Date(data.return_date).getTime() / 1000;
        let time_now_epoch = Date.now() / 1000;

        // Reject the return date if it is in the past
        if(return_date_epoch < time_now_epoch) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        // Reject the return date if it is further than three months
        if(return_date_epoch > (time_now_epoch + 7889231)) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let should_send_mail = true;
        // Due book notice email should be sent out two weeks before return date
        let send_mail_time = return_date_epoch - 1209600;

        // However, if the two weeks notice would be sent in the past, don't send it all
        // (The student should be aware that their book is due soon anyways)
        if(send_mail_time < time_now_epoch) should_send_mail = false;

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        let user_books = ( user.books == undefined ? [] : user.books );

        if(book.exists && book.data().available == true){
            user_books.push(book.data().isbn);
            users.doc(data.username).update({
                books: user_books
            });
            books.doc(book.data().isbn).update({
                available: false,
                holder: data.username,
                return_date: return_date_epoch
            });

            if(should_send_mail){
                const mail_constructor = new MailConstructor(data.username, send_mail_time);
                let date = new Date(return_date_epoch * 1000);
                let mail = mail_constructor.constructMail("book_due", toTitleCase(book.data().title), `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`);
                queueMail(book.data().isbn, mail, email_queue);
            }

            socket.emit("check-out-result", {message: "Checked out book!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }else{
            socket.emit("check-out-result", {message: "Could not check out book.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}