const { verify } = require("../../utils/verify.js");
const { MailConstructor } = require("../../utils/templateMails.js");
const { sendMail } = require("../../utils/sendMail.js");

module.exports = (socket, users) => {
    socket.on("admin-send-mail", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data.recipients || !data.subject || !data.email) { socket.emit("admin-send-mail-results", {message: "Invalid fields", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }
        
        let exists = [];
        let not_exists = [];
        let code = 201;

        if(data.recipients == "ALL"){
            const all_students = await users.get();
            for(let i = 0; i < all_students.docs.length; i++){
                const mail_constructor = new MailConstructor(all_students.docs[i].id, Date.now() / 1000);
                let mail = mail_constructor.constructMail("custom", data.subject, data.email, data.username);
                sendMail(all_students.docs[i].id, mail, users);
            }
        }else{
            code = 200;
            const all_recipients = data.recipients.split(" ");
            for(let i = 0; i < all_recipients.length; i++){
                const recipient = await users.doc(all_recipients[i]).get();
                if(recipient.exists){
                    const mail_constructor = new MailConstructor(recipient.id, Date.now() / 1000);
                    let mail = mail_constructor.constructMail("custom", data.subject, data.email, data.username);
                    sendMail(recipient.id, mail, users);
                    exists.push(all_recipients[i]);
                }else{
                    not_exists.push(all_recipients[i]);
                }
            }
        }

        socket.emit("admin-send-mail-results", {message: "Mail sent!", bgColor: "#55FF55", txColor: "#000000", exists: exists, not_exists: not_exists, code: code});

    });
}