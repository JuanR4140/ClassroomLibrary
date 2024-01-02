const { verify } = require("../../utils/verify.js");

const PAGE_SIZE = 20;

module.exports = (socket, users, books) => {
    socket.on("search-query", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.query || !data.filter) { socket.emit("search-query-results", { results: [] }); return; }

        let allowed_filters = ["title", "author", "genre"];
        if(!allowed_filters.includes(data.filter)) { socket.emit("search-query-results", { results: [] }); return; }

        let query = data.query.toLowerCase();
        let filter = data.filter.toLowerCase();

        let lastResult;         // lastResult is used as an offset to "paginate" queries
        let queryResults = [];  // queryResults is used to hold the final data
        let snapshot;           // snapshot is used when calling the query snapshot

        // If the filter is of "genre", declare query snapshot by getting results that match genre
        let queryResultsSnapshot = ( filter == "genre" ? books.where("genre", "==", query).orderBy("title") : null );

        const keywords = query.split(" ");  // keywords will be used when searching for queries other than genres
        let uniqueDocIds = new Set();       // uniqueDocIds will be used to prevent duplicates from showing in the results

        for(const keyword of keywords){
            if(filter != "genre"){
                // If the filter is not of "genre", declare query snapshot by getting results from keyword that matches keywords
                queryResultsSnapshot = books.where("keywords", "array-contains", keyword).orderBy("title");
            }

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
                const docId = doc.id;
                // if the filter is not of "genre" and the doc id
                // is unique, add it to the final results and append to uniqueDocIds
                if(filter != "genre" && !uniqueDocIds.has(docId)){
                    queryResults.push(doc.data());
                    uniqueDocIds.add(docId);
                }else if(filter == "genre"){
                    // if the filter is of "genre", just append the data
                    queryResults.push(doc.data());
                }
            });

        }

        // Send back data to client
        socket.emit("search-query-results", {
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