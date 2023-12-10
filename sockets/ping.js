const { verify } = require("../utils/verify.js");
module.exports = (socket, users) => {
    socket.on("ping", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        socket.emit("success");
    });
}