const { logger } = require("../system/logger.js");

let sendMail = async (username, mail, users) => {
    await users.doc(username).collection("inbox").add(mail);
    logger.log(`[MAIL] Sent mail to ${mail.recipient}'s inbox.`);
}

module.exports = {
    sendMail
}
