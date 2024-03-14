const jimp = require("jimp");
const fs = require("fs");

const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, bucket) => {
    socket.on("admin-add-book", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        data.genre = data.genre.toLowerCase();

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }
        let allowed_genres = ["fiction"];

        if(!data.isbn || !data.title || !data.author || !data.genre){ socket.emit("admin-add-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        if(data.isbn.length == 0 || data.title.length == 0 || data.author.length == 0 || !allowed_genres.includes(data.genre)){
            socket.emit("admin-add-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        // console.log(data.cover);

        const bookRef = await books.doc(data.isbn);
        const book = bookRef.get();
        if(book.exists){ socket.emit("admin-add-book-result", { msg: "Book already in database.", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        const buffer = Buffer.from(data.cover, "base64");
        jimp.read(buffer, async (err, res) => {
            if(err) throw new Error(err);
            // res.quality(50).write("./sockets/admin/media/" + data.isbn + ".jpg");
            await res.quality(50).writeAsync("./sockets/admin/media/" + data.isbn + ".jpg");
            let file = "./sockets/admin/media/" + data.isbn + ".jpg";
            await bucket.upload(file);
            fs.unlink("./sockets/admin/media/" + data.isbn + ".jpg", (err) => {});
            books.doc(data.isbn).set({
                author: data.author.toLowerCase(),
                available: true,
                genre: data.genre.toLowerCase(),
                holder: "",
                image: `https://firebasestorage.googleapis.com/v0/b/wilkins-clasroom-library.appspot.com/o/${data.isbn}.jpg?alt=media`,
                isbn: data.isbn,
                title: data.title.toLowerCase(),
                reviews: {}
            });

            socket.emit("admin-add-book-result", {msg: "Book added to database!", bgColor: "#55FF55", txColor: "#000000"});
        });

    });
}