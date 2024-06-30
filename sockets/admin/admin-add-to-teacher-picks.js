const path = require("path");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, teacher_picks) => {
    socket.on("admin-add-to-teacher-picks", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data || !data.isbn){ socket.emit("admin-delete-book-review-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        if(!book.exists){ socket.emit("admin-add-to-teacher-picks-result", { msg: "Book doesn't exist?", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        const pickRef = await teacher_picks.doc(data.isbn);
        const pick = await pickRef.get();
        if(pick.exists){ socket.emit("admin-add-to-teacher-picks-result", { msg: "Book already in Teacher's Picks!", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        const encodedUrl = encodeURI(book.data().title.toLowerCase());

        teacher_picks.doc(data.isbn).set({
            image: book.data().image,
            isbn: data.isbn,
            title: book.data().title.toLowerCase(),
            link: `search?query=${encodedUrl}&filter=title`
        });

        socket.emit("admin-add-to-teacher-picks-result", { msg: "Book added to Teacher's Picks!", bgColor: "#55FF55", txColor: "#000000" });

    });
}
