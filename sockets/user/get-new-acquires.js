const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("get-new-acquires", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let queryResults = [];

        // let snapshot = await books.limit(5).get();
        let snapshot = await books.orderBy("creation_date", "desc").limit(5).get();

        snapshot.forEach(doc => {
            queryResults.push(doc.data());
        });

        socket.emit("get-new-acquires-result", {
            results: queryResults
        });

    });
}
