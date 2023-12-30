const { verify } = require("../../utils/verify.js");

module.exports = (socket, users) => {
    socket.on("mark-read", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.id) { return; }

        const mailRef = await users.doc(data.username).collection("inbox").doc(data.id);
        const mail = await mailRef.get();

        if(mail.exists){
            const res = await mailRef.update({
                unread: false
            });
        }

    });
}