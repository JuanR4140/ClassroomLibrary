const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("get-checked-out-books", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let booksInDB = ( user.books == undefined ? [] : user.books );
        let checkedOutBooks = [];
        if(booksInDB.length != 0){
            for(const book of booksInDB){
                const bookRef = await books.doc(book);
                const bookData = await bookRef.get();
                checkedOutBooks.push(bookData.data());
            }
            socket.emit("checked-out-books-results", checkedOutBooks);
            return;
        }

        socket.emit("checked-out-books-results", []);

    });
}