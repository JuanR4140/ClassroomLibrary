const jimp = require("jimp");
const fs = require("fs");

const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, storage) => {
    socket.on("admin-add-book", async (data) => {
        console.log("Connection received!");
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }
        let allowed_genres = ["fiction"];

        if(data.isbn.length == 0 || data.title.length == 0 || data.author.length == 0 || !allowed_genres.includes(data.genre)){
            socket.emit("admin-add-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        // console.log(data.cover);

        const buffer = Buffer.from(data.cover, "base64");
        jimp.read(buffer, (err, res) => {
            if(err) throw new Error(err);
            /*console.log("writing image...");
            res.quality(50).write("./public/books/" + data.isbn + ".png");
            console.log("image written.");*/

            const fileName = data.isbn + ".png";
        });

    });
}