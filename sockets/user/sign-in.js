const bcrypt = require("bcrypt");
const saltrounds = 10;

const { verify } = require("../../utils/verify.js");
const { generateToken } = require("../../utils/generateToken.js");
const { MailConstructor } = require("../../utils/templateMails.js");
const { sendMail } = require("../../utils/sendMail.js");
const { logger } = require("../../system/logger.js");

module.exports = (socket, users, miscellaneous) => {
    socket.on("sign-in", async (data) => {
        if(!data.email || !data.password){ socket.emit("sign-in-result", {message: "Can not have empty fields.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }
    
        data.email = data.email.split("@");
        let email = data.email[0];
        let domain = data.email[1];
        
        if(domain != process.env.valid_email_domain || !email || !domain) { socket.emit("sign-in-result", {message: "Not a valid email address.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }
        let lastFour = email.slice(-4);

        // isNaN can lead to unexpected results, use isFinite instead
        if(!isFinite(lastFour)) { socket.emit("sign-in-result", {message: "Invalid email format.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

        const userRef = await users.doc(email);
        const user = await userRef.get();

        let token = generateToken(128);
        let cookie_name = `username=${email}; path=/;`;
        let cookie_token = `token=${token}; path=/;`;

        if(user.exists){
            if(data.action != "log-in"){ socket.emit("sign-in-result", {message: "Account already exists!", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }
            const hash = await user.data().password;
            bcrypt.compare(data.password, hash, (err, res) => {
                if(!res){socket.emit("sign-in-result", {message: "Invalid credentials.", bgColor: "#FF5555", txColor: "#FFFFFF"}); return;}

                userRef.update({
                    token: token
                });
                logger.log(`[ACNT] ${email} logged in.`);
                socket.emit("sign-in-result", {
                    message: "Logged in! Redirecting..",
                    bgColor: "#55FF55",
                    txColor: "#000000",
                    code: 200,
                    cookie_name: cookie_name,
                    cookie_token: cookie_token
                });
            });

        }else{

            if(data.action != "sign-up") { socket.emit("sign-in-result", {message: "Account does not exist!", bgColor: "#FF5555", txColor: "#FFFFFF"}); return; }

            /*
            const pin_doc = await miscellaneous.doc("pin_state").get();
            const pin_data = await pin_doc.data();

            if(!pin_data.enabled || !data.pin == pin_data.pin){
                socket.emit("sign-in-result", {
                    message: "Pin not active/Invalid Pin",
                    bgColor: "#FF5555",
                    txColor: "#FFFFFF"
                });

                return;
            }
            */

            let join_date = Date.now() / 1000;


            bcrypt.hash(data.password, saltrounds, async (err, hash) => {
                userRef.set({
                    username: email,
                    password: hash,
                    token: token,

                    books: [],
                    wishlist: [],
                    join_date: join_date
                });
                logger.log(`[ACNT] Account created for ${email}.`);

                // When a user creates an account,
                // they'll get sent a welcome email :)

                const mail_constructor = new MailConstructor(email, Date.now() / 1000);
                let mail = mail_constructor.constructMail("welcome");
                sendMail(email, mail, users);

                socket.emit("sign-in-result", {
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
