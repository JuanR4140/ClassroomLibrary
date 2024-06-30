const path = require("path");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, teacher_picks) => {
    socket.on("admin-remove-from-teacher-picks", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        if(!data || !data.isbn){ socket.emit("admin-remove-from-teacher-picks-result", {msg: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const pickRef = await teacher_picks.doc(data.isbn);
        const pick = await pickRef.get();
        if(!pick.exists){ socket.emit("admin-remove-from-teacher-picks-result", { msg: "Book not in Teacher's Picks!", bgColor: "#FF5555", txColor: "#FFFFFF" }); return; }

        const res = await teacher_picks.doc(data.isbn).delete();

        socket.emit("admin-remove-from-teacher-picks-result", { msg: "Book removed from Teacher's Picks!", bgColor: "#55FF55", txColor: "#000000" });

    });
}
