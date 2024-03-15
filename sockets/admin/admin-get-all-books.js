const { verify } = require("../../utils/verify.js");

const PAGE_SIZE = 20;
//// DUCK IT JUST REUSE THE USER SEARCH QUERY CODE
module.exports = (socket, users, books) => {
    socket.on("admin-get-all-books", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let lastResult;         // lastResult is used as an offset to "paginate" queries
        let queryResults = [];  // queryResults is used to hold the final data
        let snapshot;           // snapshot is used when calling the query snapshot

        // If the filter is of "genre", declare query snapshot by getting results that match genre
        let queryResultsSnapshot = books.orderBy("title");

        if(data.lastResult){
            // If the client provides a lastResult parameter in their request,
            // use it as an offset to request further results
            queryResultsSnapshot = queryResultsSnapshot.startAfter(data.lastResult);
        }

        // declare snapshot to get the constructed query with a limit of PAGE_SIZE
        snapshot = await queryResultsSnapshot.limit(PAGE_SIZE).get();

        // then, declare lastResult (if able to) to send to the client to be able to
        // "paginate" and request more results
        lastResult = snapshot.docs[snapshot.docs.length - 1]?.data().title || "";

        snapshot.forEach(doc => {
            queryResults.push(doc.data());
        });

        // Send back data to client
        socket.emit("admin-get-all-books-results", {
            results: queryResults,
            lastResult: lastResult
        });
        
        ///////////////////////////////////////////////////////////

        /*const snapshot = await books.where(filter, "==", query).get();
        if(snapshot.empty){
            socket.emit("search-query-results", []);
            return;
        }

        let results = [];
        snapshot.forEach(doc => {
            results.push(doc.data());
        });
        socket.emit("search-query-results", results);*/

    });
}