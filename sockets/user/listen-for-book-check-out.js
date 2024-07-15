const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("listen-for-book-check-out", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.isbn || data.isbn.length != 13) { return; }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();

        let poll = undefined;
        let snapshotDetached = false;

        if(book.exists){
            poll = bookRef.onSnapshot((doc) => {
                if(!doc.data().available){
                    // Book has been considered checked out.
                    // Alert student.
                    socket.emit("listen-for-book-check-out-result", { message: "Book checked out!", bgColor: "#55FF55", txColor: "#000000" });
                    // Finally, detach the snapshot listener...
                    if(!snapshotDetached && poll != undefined){
                        poll();
                        snapshotDetached = true;
                    }
                }
            }, (error) => {});
        }else{
            poll = undefined;
            snapshotDetached = true;
        }

        setTimeout(() => {
            // Give the snapshot listener
            // 60 seconds to live before 
            // detaching it forcefully.
            if(!snapshotDetached && poll != undefined){
                poll();
                snapshotDetached = true;
                socket.emit("listen-for-book-check-out-result", { message: "Listener disconnected: updates paused.", bgColor: "#FF5555", txColor: "#FFFFFF" });
            }
        }, 60000);

    });
}
