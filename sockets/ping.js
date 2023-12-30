const { verify } = require("../utils/verify.js");
module.exports = (socket, users) => {
    socket.on("ping", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let ping_results = {}
        
        // User is verified, get amount of unread mail
        const snapshot = await users.doc(data.username).collection("inbox").where("unread", "==", true).get();
        ping_results.unread = snapshot._size;

        socket.emit("success", ping_results);
    });
}