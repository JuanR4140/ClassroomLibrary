const fs = require("fs");
const path = require("path");
const { verify } = require("../../utils/verify.js");
const { logger } = require("../../system/logger.js");

module.exports = (socket, users) => {
    socket.on("admin-clear-logs", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        const log_path = path.join(__dirname + "../../../system/log.txt");
        fs.unlink(log_path, (err) => {});

        logger.log("[INFO] System logs cleared.");

    });
}