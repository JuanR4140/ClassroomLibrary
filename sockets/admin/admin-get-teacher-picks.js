const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, teacher_picks) => {
    socket.on("admin-get-teacher-picks", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let queryResults = [];

        let snapshot = await teacher_picks.get();

        snapshot.forEach(doc => {
            queryResults.push(doc.data());
        });

        socket.emit("admin-get-teacher-picks-result", {
            results: queryResults
        });

    });
}
