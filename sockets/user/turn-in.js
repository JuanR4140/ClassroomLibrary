const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("turn-in", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let allowed_stars = ["N", "1", "2", "3", "4", "5"];
        if(!allowed_stars.includes(data.stars)){
            socket.emit("modify-results", {message: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        if(data.stars != "N"){
            if(data.review.length < 25){
                socket.emit("modify-results", {message: "Review too short.", bgColor: "#FF5555", txColor: "#FFFFFF"});
                return;
            }
        }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        let user_books = ( user.books == undefined ? [] : user.books );

        if(book.exists && user_books.includes(book.data().isbn)){
            let element = user_books.indexOf(book.data().isbn);
            user_books.splice(element, 1);

            users.doc(data.username).update({
                books: user_books
            });
            books.doc(book.data().isbn).update({
                available: true,
                holder: ""
            });

            if(data.stars != "0"){
                let reviews = book.data().reviews;
                let d = {
                    rating: parseInt(data.stars),
                    review: data.review
                };
                reviews[data.username] = d;
                
                books.doc(book.data().isbn).update({
                    reviews: reviews
                });
            }

            socket.emit("modify-results", {message: "Book turned in!", bgColor: "#55FF55", txColor: "#000000"});
        }else{
            socket.emit("modify-results", {message: "Could not turn in book.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}