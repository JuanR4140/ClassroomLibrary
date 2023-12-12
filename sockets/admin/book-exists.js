module.exports = (socket, books) => {
    socket.on("book-exists", (data) => {
        if(data.isbn == undefined || data.isbn.length == 0){
            socket.emit("book-exists-result", false);
            return;
        }
        
        const bookRef = books.doc(data.isbn);
        const book = bookRef.get();
        socket.emit("book-exists-result", book.exists);
    });
}