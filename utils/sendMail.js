
let sendMail = (username, mail, users) => {
    // Simple for now, but should be logged when server logging is implemented
    users.doc(username).collection("inbox").add(mail);
}

module.exports = {
    sendMail
}
