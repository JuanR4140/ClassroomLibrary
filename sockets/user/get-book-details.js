const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("get-book-details", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }
        
        if(!data.isbn || data.isbn.length != 13) { socket.emit("get-book-details-result", { code: 404 }); return; }

        const book_doc = await books.doc(data.isbn).get();
        const book_data = await book_doc.data();

        let wishlistInDB = ( user.wishlist == undefined ? [] : user.wishlist );
        book_data.inWishlist = wishlistInDB.includes(data.isbn);

        socket.emit("get-book-details-result", {
            code: 200,
            details: book_data
        });
        
    });
}
