const { verify } = require("../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("search-query", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let query = data.query;
        let filter = data.filter;

        const snapshot = await books.where(filter, "==", query).get();
        if(snapshot.empty){
            socket.emit("search-query-results", []);
            return;
        }

        let results = [];
        snapshot.forEach(doc => {
            results.push(doc.data());
        });
        socket.emit("search-query-results", results);

    });
}