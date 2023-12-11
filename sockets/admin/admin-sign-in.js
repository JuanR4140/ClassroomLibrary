const bcrypt = require("bcrypt");
const saltrounds = 10;

const { generateToken } = require("../../utils/generateToken.js");

module.exports = (socket, users) => {
    socket.on("admin-sign-in", async (data) => {
        if(!data.email || !data.password) { socket.emit("admin-sign-in-result", {message: "Can not have empty fields.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        if(data.email != process.env.valid_admin_email) { socket.emit("admin-sign-in-result", {message: "Invalid credentials.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const adminRef = await users.doc(process.env.valid_admin_email.split("@")[0]);
        const admin = await adminRef.get();

        let token = generateToken(256);
        let cookie_name = `username=${process.env.valid_admin_email.split("@")[0]}; path=/;`;
        let cookie_token = `token=${token}; path=/;`;

        if(admin.exists){
            const hash = await admin.data().password;
            bcrypt.compare(data.password, hash, (err, res) => {
                if(!res){socket.emit("admin-sign-in-result", {message: "Invalid credentials.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return;}

                users.doc(process.env.valid_admin_email.split("@")[0]).update({
                    token: token
                });
                socket.emit("admin-sign-in-result", {
                    message: "Logged in! Redirecting..",
                    bgColor: "#55FF55",
                    txColor: "#000000",
                    code: 200,
                    cookie_name: cookie_name,
                    cookie_token: cookie_token
                });
            });
        }else{
            bcrypt.hash(data.password, saltrounds, async (err, hash) => {
                users.doc(process.env.valid_admin_email.split("@")[0]).set({
                    password: hash,
                    token: token,
                });
                socket.emit("admin-sign-in-result", {
                    message: "Account created! Redirecting..",
                    bgColor: "#55FF55",
                    txColor: "#000000",
                    code: 200,
                    cookie_name: cookie_name,
                    cookie_token: cookie_token
                });
            });
        }

    });
}