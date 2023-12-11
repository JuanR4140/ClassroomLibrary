const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("remove-wishlist", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        let user_wishlist = ( user.wishlist == undefined ? [] : user.wishlist );

        if(book.exists && user_wishlist.includes(book.data().isbn)){
            let element = user_wishlist.indexOf(book.data().isbn);
            user_wishlist.splice(element, 1);

            users.doc(data.username).update({
                wishlist: user_wishlist
            });

            socket.emit("modify-results", {message: "Book removed from wishlist!", bgColor: "#55FF55", txColor: "#000000"});
        }else{
            socket.emit("modify-results", {message: "Could not remove book from wishlist.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}