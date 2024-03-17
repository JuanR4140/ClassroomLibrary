const { toTitleCase } = require("../../utils/toTitleCase.js");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books) => {
    socket.on("admin-force-return-book", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data.isbn){ socket.emit("admin-force-return-book-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }
        
        const student = await users.doc(data.student).get();
        let student_books = student.data().books;
        if(student.exists){
            const bookRef = await books.doc(data.isbn);
            const book = await bookRef.get();

            if(book.exists && student_books.includes(book.data().isbn)){
                let element = student_books.indexOf(book.data().isbn);
                student_books.splice(element, 1);

                users.doc(data.student).update({
                    books: student_books
                });

                books.doc(book.data().isbn).update({
                    available: true,
                    holder: "",
                    checked_out: "",
                    return_date: ""
                });

                socket.emit("admin-force-return-book-result", {msg: "Forced book return!", bgColor: "#55FF55", txColor: "#000000"});
            }else{
                socket.emit("admin-force-return-book-result", {msg: "Student doesn't have this book checked out.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            }
        }else{
            socket.emit("admin-force-return-book-result", {msg: "Student doesn't exist.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }
    });
}