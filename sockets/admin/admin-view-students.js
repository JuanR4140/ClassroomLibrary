const { verify } = require("../../utils/verify.js");

const PAGE_SIZE = 20;
// At this point, getting a large amount of data,
// it's useful to instead divide it into chunks
// instead of getting all of it at once

module.exports = (socket, users, books) => {
    socket.on("admin-view-students", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        let lastResult;
        let data_results = [];
        let snapshot;

        let snapshotQuery = users.orderBy("username").orderBy("join_date");
        if(data.lastResult && data.lastResult.username != undefined && data.lastResult.join_date != undefined){
            snapshotQuery = snapshotQuery.startAfter(data.lastResult.username, data.lastResult.join_date);
        }

        snapshot = await snapshotQuery.limit(PAGE_SIZE).get();
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        lastResult = {
            username: lastDoc?.data().username || "",
            join_date: lastDoc?.data().join_date || ""
        }

        const promises = snapshot.docs.map(async (user) => {
            let user_data = {};
            user_data.username = user.data().username;

            if(user.data().username == process.env.valid_admin_email.split("@")[0]){
                return;
            }

            let user_books = user.data().books;
            user_data.books = [];

            if(user_books){
                for(const book of user_books){
                    const bookRef = await books.doc(book);
                    const bookData = await bookRef.get();
                    let title = await bookData.data().title;
                    let isbn = await bookData.data().isbn;
                    let checked_out = await bookData.data().checked_out;
                    let return_date = await bookData.data().return_date;
                    user_data.books.push({
                        title: title,
                        isbn: isbn,
                        checked_out: checked_out,
                        return_date: return_date
                    });
                }
            }

            data_results.push(user_data);
        });

        await Promise.all(promises);

        socket.emit("admin-view-students-results", {
            data: data_results,
            lastResult: lastResult
        });

    });
}
