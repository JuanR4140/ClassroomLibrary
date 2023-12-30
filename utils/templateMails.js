
let mail_templates = {
    welcome: {
        unread: true,
        title: "Welcome to the classroom library!",
        author: "[SYSTEM]",
        date: "", // date should be set at time of message sending
        message: "Dear [USER],\n\nThanks for signing up for the classroom library! I'm Juan, the proud creator behind this site! Crafting this project was fun, challening, and really exciting! I can't wait for you try it!\n\nLet's talk about some features! Feel free to browse through the catalogue of books now available at your fingertips! With a large variety of books, there's bound to be something to catch your eye!\n\nWhen you find a book that you'd love to read, you can check it out virtually! Afterwards, you can pick up the physical copy in-class! Easy as that!\n\nThis site was made to make browsing the classroom library easier. Should you have any questions, feel free to reach out to the teacher!\n\nRemember, this website isn't just a tool for the classroom; it's a symbol that each of us has the potential to create something impactful. I hope it inspires you all to dream big and chase those dreams with passion and persistence.\n\nHappy reading!\n\nWarm regards,\n\nJuan R."
    }
}

class MailConstructor{
    constructor(username, date){
        this.username = username;
        this.date = date;
    }

    constructMail(template){
        let mail_template = mail_templates[template];

        mail_template.date = this.date;
        mail_template.message = mail_template.message.replace("[USER]", this.username);

        return mail_template;
    }
}

module.exports = {
    MailConstructor
}