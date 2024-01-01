const { logger } = require("./logger.js");
const { sendMail } = require("../utils/sendMail.js");

const schedule = require("node-schedule");

let registerDueBookNoticeChecks = (users, email_queue) => {
    // “At 07:00 on every day-of-month.”
    // https://crontab.guru/#0_7_*/1_*_*
    
    const job = schedule.scheduleJob("0 7 */1 * *", async () => {
        // Every day at 0700, this piece of code should run.
        // This code is responsible for fetching all mail from the email_queue
        // that should be sent out, then sends it out and deletes it from the queue.
        logger.log("[INFO] SYSTEM starting daily email queue check & sending..");

        let time_now_epoch = Date.now() / 1000;

        const snapshot = await email_queue.where("date", "<=", time_now_epoch).get();
        if(snapshot.empty){
            logger.log("[INFO] SYSTEM has no emails to send. Email queue clear!");
            return;
        }

        snapshot.forEach(mail => {
            sendMail(mail.data().recipient, mail.data(), users);
            email_queue.doc(mail.id).delete();
            logger.log(`[INFO] SYSTEM sent mail to ${mail.data().recipient} from the email queue.`);
        });

        logger.log("[INFO] SYSTEM sent all mail for today!");

    });

    console.log("'Due book notice' check scheduler registered.");

    return job;

}

module.exports = {
    registerDueBookNoticeChecks
}
