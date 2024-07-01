const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, bucket) => {
    socket.on("admin-add-book", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        data.title = data.title.toLowerCase();
        data.author = data.author.toLowerCase();
        data.genre = data.genre.toLowerCase();

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }
        let allowed_genres = ["fiction"];

        if(!data.isbn || !data.title || !data.author || !data.genre){ socket.emit("admin-add-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        if(data.isbn.length == 0 || data.title.length == 0 || data.author.length == 0 || !allowed_genres.includes(data.genre)){
            socket.emit("admin-add-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        let title_keywords = data.title.split(" ");
        let author_keywords = data.author.split(" ");
        let keywords = title_keywords.concat(author_keywords);

        // console.log(data.cover);

        const bookRef = await books.doc(data.isbn);
        const book = bookRef.get();
        if(book.exists){ socket.emit("admin-add-book-result", { msg: "Book already in database.", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }
        
        const buffer = Buffer.from(data.cover, "base64");

        const sanitizedFileName = data.isbn.replace(/[^0-9]/g, '');
        const sanitizedPath = path.resolve(__dirname, `../admin/media/${sanitizedFileName}.jpg`);
        if(sanitizedFileName.length != 13){ socket.emit("admin-add-book-result", { msg: `Invalid ISBN length of ${sanitizedFileName.length}. Must be 13.`, bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        jimp.read(buffer, async (err, res) => {
            if(err) throw new Error(err);
            // res.quality(50).write("./sockets/admin/media/" + data.isbn + ".jpg");

            await res.quality(50).writeAsync(sanitizedPath);
            await bucket.upload(sanitizedPath);
            fs.unlink(sanitizedPath, (err) => {});

            let creation_date = Date.now() / 1000;
            
            books.doc(data.isbn).set({
                author: data.author.toLowerCase(),
                available: true,
                genre: data.genre.toLowerCase(),
                holder: "",
                image: `https://firebasestorage.googleapis.com/v0/b/wilkins-clasroom-library.appspot.com/o/${data.isbn}.jpg?alt=media`,
                isbn: data.isbn,
                title: data.title.toLowerCase(),
                creation_date: creation_date,
                reviews: {},
                keywords: keywords
            });

            socket.emit("admin-add-book-result", {msg: "Book added to database!", bgColor: "#55FF55", txColor: "#000000"});
        });

    });
}
