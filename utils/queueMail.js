const { logger } = require("../system/logger.js");

let queueMail = async (title, mail, email_queue) => {
    await email_queue.doc(title).set(mail);
    logger.log(`[INFO] Added mail to email queue for ${mail.recipient}.`);
}

module.exports = {
    queueMail
}
