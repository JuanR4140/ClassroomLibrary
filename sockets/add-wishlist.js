const { verify } = require("../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on('add-wishlist', async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let wishlistInDB = ( user.wishlist == undefined ? [] : user.wishlist );
        if(wishlistInDB.includes(data.isbn)){
            socket.emit("add-wishlist-result", {message: "Already in wishlist!", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }else{
            wishlistInDB.push(data.isbn);
            users.doc(data.username).update({
                wishlist: wishlistInDB
            });
            socket.emit("add-wishlist-result", {message: "Added to wishlist!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }

    });
}