const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("admin-delete-book-review", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(data.isbn == undefined || data.isbn.length == 0){
            socket.emit("admin-delete-book-review-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }
        
        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        if(!book.exists){ socket.emit("admin-delete-book-review-result", { msg: "Book doesn't exist?", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        let reviews = book.data().reviews;
        if(!reviews || Object.keys(reviews).length == 0){ socket.emit("admin-delete-book-review-result", { msg: "No reviews to delete?", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }
        if(!reviews[data.user]){ socket.emit("admin-delete-book-review-result", { msg: "Review doesn't exist?", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        delete reviews[data.user];

        bookRef.update({
            reviews: reviews
        });

        socket.emit("admin-delete-book-review-result", {msg: "Review deleted!", bgColor: "#55FF55", txColor: "#000000"});
    });
}