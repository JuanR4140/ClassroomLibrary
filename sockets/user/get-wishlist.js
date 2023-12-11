const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("get-wishlist", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let wishlistInDB = ( user.wishlist == undefined ? [] : user.wishlist );
        let wishlistedBooks = [];

        if(wishlistInDB.length != 0){
            for(const book of wishlistInDB){
                const bookRef = await books.doc(book);
                const bookData = await bookRef.get();
                wishlistedBooks.push(bookData.data());
            }
            socket.emit("wishlist-results", wishlistedBooks);
            return;
        }
        socket.emit("wishlist-results", []);

    });
}