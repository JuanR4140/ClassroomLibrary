const crypto = require("crypto");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, miscellaneous) => {
    socket.on("admin-set-pin-status", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }
        if(data.action != "toggle" && data.action != "refresh") return;

        const pin_doc = await miscellaneous.doc("pin_state").get();
        const pin_data = await pin_doc.data();

        let pin = pin_data.pin;
        let enabled = pin_data.enabled;

        if(data.action == "toggle"){
            miscellaneous.doc("pin_state").update({
                enabled: !pin_data.enabled
            });
            enabled = !pin_data.enabled;
        }else if(data.action == "refresh"){
            // let new_pin = (Math.floor(Math.random() * 1000) + 1001).toString()
            let new_pin = crypto.randomBytes(3).toString("hex").toUpperCase();
            miscellaneous.doc("pin_state").update({
                pin: new_pin
            });
            pin = new_pin;
        }

        socket.emit("admin-get-pin-status-result", {
            pin: pin,
            enabled: enabled
        });

    });
}
