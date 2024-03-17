const { verify } = require("../../utils/verify.js");

module.exports = (socket, users) => {
    socket.on("admin-delete-student", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data.student){
            socket.emit("admin-delete-student-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        const student = await users.doc(data.student).get();

        if(!student.exists){ socket.emit("admin-delete-student-result", { msg: "Student doesn't exist?", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }
        
        const books = student.data().books;
        if(books.length != 0){ socket.emit("admin-delete-student-result", { msg: "Student has books checked out.", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        const inbox_res = await users.doc(data.student).collection("inbox").get();
        inbox_res.forEach((doc) => {
            users.doc(data.student).collection("inbox").doc(doc.id).delete();
        });
        
        const user_res = await users.doc(data.student).delete();

        socket.emit("admin-delete-student-result", {msg: "Student removed from database!", bgColor: "#55FF55", txColor: "#000000"});
    });
}