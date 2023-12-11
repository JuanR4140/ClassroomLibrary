const { verify } = require("../utils/verify.js");
module.exports = (socket, users) => {
    socket.on("admin-ping", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        socket.emit("admin-success");
    });
}