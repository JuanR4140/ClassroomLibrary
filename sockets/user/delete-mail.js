const { verify } = require("../../utils/verify.js");

module.exports = (socket, users) => {
    socket.on("delete-mail", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.id) { socket.emit("delete-mail-results", {message: "Invalid data", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const mailRef = await users.doc(data.username).collection("inbox").doc(data.id);
        const mail = await mailRef.get();

        if(mail.exists){
            const res = await mailRef.delete();
            socket.emit("delete-mail-results", {message: "Mail deleted!", bgColor: "#55FF55", txColor: "#000000"});
        }else{
            socket.emit("delete-mail-results", {message: "Could not delete mail", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}