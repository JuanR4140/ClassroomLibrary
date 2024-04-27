const { verify } = require("../../utils/verify.js");

module.exports = (socket, users) => {
    socket.on("get-mail", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let mail = [];

        const snapshot = await users.doc(data.username).collection("inbox").get();
        snapshot.docs.forEach(doc => {
            let doc_data = doc.data();
            doc_data["id"] = doc.id;
            mail.push(doc_data);
        });

        // Sort the array so the most recent mails will be first
        mail.sort((a, b) => b.date - a.date); // <-- In the future, make the client sort the array instead of the server.

        socket.emit("get-mail-results", mail);

    });
}