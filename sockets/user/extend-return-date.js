const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("extend-return-date", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(!data.return_date) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        let return_date_epoch = new Date(data.return_date).getTime() / 1000;
        let time_now_epoch = Date.now() / 1000;

        // Reject the return date if it is in the past
        if(return_date_epoch < time_now_epoch) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        // Reject the return date if it is further than three months
        if(return_date_epoch > (time_now_epoch + 7889231)) { socket.emit("modify-results", {message: "Invalid return date.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();

        // Confirm the book a) exists, b) is checked out, c) and is checked out by the person who originated the request
        if(book.exists && book.data().available == false && book.data().holder == data.username){
            books.doc(book.data().isbn).update({
                return_date: return_date_epoch
            });
            socket.emit("modify-results", {message: "Return date was updated!", bgColor: "#55FF55", txColor: "#000000", code: 200});
        }else{
            socket.emit("modify-results", {message: "Could not update return date.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}