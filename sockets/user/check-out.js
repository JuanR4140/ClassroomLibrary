const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("check-out", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.return_date) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let return_date_epoch = new Date(data.return_date).getTime() / 1000;
        let time_now_epoch = Date.now() / 1000;

        // Reject the return date if it is in the past
        if(return_date_epoch < time_now_epoch) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        // Reject the return date if it is further than three months
        if(return_date_epoch > (time_now_epoch + 7889231)) { socket.emit("check-out-result", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

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
                holder: data.username,
                return_date: return_date_epoch
            });
            socket.emit("check-out-result", {message: "Checked out book!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }else{
            socket.emit("check-out-result", {message: "Could not check out book.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}