
let queueMail = async (title, mail, email_queue) => {
    // Simple for now, but should be logged when server logging is implemented
    await email_queue.doc(title).set(mail);
}

module.exports = {
    queueMail
}
