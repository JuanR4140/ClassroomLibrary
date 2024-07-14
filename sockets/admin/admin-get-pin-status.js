const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, miscellaneous) => {
    socket.on("admin-get-pin-status", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        if(data.username != process.env.valid_admin_email.split("@")[0]){ socket.emit("fatal"); return; }

        const pin_doc = await miscellaneous.doc("pin_state").get();
        const pin_data = await pin_doc.data();

        socket.emit("admin-get-pin-status-result", {
            pin: pin_data.pin,
            enabled: pin_data.enabled
        });

    });
}
