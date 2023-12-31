
const mail_templates = {
    welcome: {
        recipient: "",
        unread: true,
        title: "Welcome to the classroom library!",
        author: "[SYSTEM]",
        date: "", // date should be set at time of message sending
        message: "Dear [USER],<br><br>Thanks for signing up for the classroom library! I'm Juan, the proud creator behind this site! Crafting this project was fun, challenging, and really exciting! I can't wait for you to try it! 😄<br><br>Let's talk about some features! Feel free to browse through the catalogue of books now available at your fingertips! With a large variety of books, there's bound to be something to catch your eye! 👀<br><br>When you find a book that you'd love to read, you can check it out virtually! Afterwards, you can pick up the physical copy in-class! Easy as that! 🚀<br><br>This site was made to make browsing the classroom library easier. Should you have any questions, feel free to reach out the teacher! 😎<br><br>Remember, this website isn't just a tool for the classroom; it's a symbol that each of us has the potential to create something impactful. I hope it inspires you all to dream big and chase those dreams with passion and persistence. 🫡<br><br>Happy reading! 📖<br><br>Warm regards,<br><br>Juan R. 💻"
    },

    book_due:{
        recipient: "",
        unread: true,
        title: "DUE BOOK NOTICE",
        author: "[SYSTEM]",
        date: "",
        message: "Dear [USER],<br><br>We are writing to inform you that your book, [TITLE], is due by [DATE].<br><br>If you would like to extend your due date, please go to <a class='text-sky-500 dark:text-sky-600 cursor-pointer' href='/my-books'>My Books</a> and set your new due date. If you are done reading, please return the book both virtually and physically.<br><br>Thank you, and happy reading!<br><br>This is an automated response by the system."
    }
}

class MailConstructor{
    constructor(username, date){
        this.username = username;
        this.recipient = username;
        this.date = date;
    }

    constructMail(template, arg1, arg2){
        let mail_template = { ...mail_templates[template] };

        mail_template.recipient = this.username;
        mail_template.date = this.date;
        mail_template.message = mail_template.message.replace("[USER]", this.username);

        if(template == "book_due"){
            mail_template.message = mail_template.message.replace("[TITLE]", arg1);
            mail_template.message = mail_template.message.replace("[DATE]", arg2);
        }

        return mail_template;
    }
}

module.exports = {
    MailConstructor
}