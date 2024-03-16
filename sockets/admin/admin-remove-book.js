const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, bucket) => {
    socket.on("admin-remove-book", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data.isbn) { socket.emit("admin-remove-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        if(data.isbn.length == 0){
            socket.emit("admin-remove-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();

        if(!book.exists){ socket.emit("admin-remove-book-result", { msg: "Book doesn't exist.", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        if(book.data().holder){
            socket.emit("admin-remove-book-result", { msg: "Book is currently checked out.", bgColor: "#FF5555", txColor: "#FFFFFF" }); return;
        }

        const res = await books.doc(data.isbn).delete();

        // Remove image from database
        const del_res = await bucket.file(data.isbn + ".jpg").delete();

        socket.emit("admin-remove-book-result", { msg: "Book removed from database!", bgColor: "#55FF55", txColor: "#000000" });
    });
}