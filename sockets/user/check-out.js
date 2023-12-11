const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("check-out", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        let user_books = ( user.books == undefined ? [] : user.books );

        if(book.exists && book.data().available == true){
            user_books.push(book.data().isbn);
            users.doc(data.username).update({
                books: user_books
            });
            books.doc(book.data().isbn).update({
                available: false,
                holder: data.username
            });
            socket.emit("check-out-result", {message: "Checked out book!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }else{
            socket.emit("check-out-result", {message: "Could not check out book.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}