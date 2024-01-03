const fs = require("fs");
const path = require("path");
const { verify } = require("../../utils/verify.js");
const { logger } = require("../../system/logger.js");

module.exports = (socket, users) => {
    socket.on("admin-view-logs", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        const log_path = path.join(__dirname + "../../../system/log.txt");
        
        fs.readFile(log_path, "utf-8", (err, log) => {
            if(err){
                logger.log(`[ERROR] ADMIN ${data.username} tried reading log, but failed.`);
                socket.emit("admin-view-logs-results", "Could not fetch system log! :(");
                return;
            }

            socket.emit("admin-view-logs-results", log);

        });

    });
}