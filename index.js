require("dotenv").config();
const ejs = require("ejs");
const express = require("express");

const { db, books, users } = require("./firebase/firebase.js");

const PORT = 3000;

const app = express();

app.engine("html", ejs.renderFile);
app.use(express.static("./public"));

const server = app.listen(PORT, () => {console.log(`Listening on port ${PORT}! 🚀`)});
const io = require("socket.io")(server);

io.on("connection", (socket) => {
    console.log("New connection.");

    require("./sockets/ping.js")(socket, users);
    require("./sockets/admin-ping.js")(socket, users);

    
    require("./sockets/user/sign-in.js")(socket, users);
    require("./sockets/user/search-query.js")(socket, users, books);
    require("./sockets/user/check-out.js")(socket, users, books);
    require("./sockets/user/turn-in.js")(socket, users, books);
    require("./sockets/user/get-checked-out-books.js")(socket, users, books);
    require("./sockets/user/add-wishlist.js")(socket, users, books);
    require("./sockets/user/remove-wishlist.js")(socket, users, books);
    require("./sockets/user/get-wishlist.js")(socket, users, books);


    require("./sockets/admin/admin-sign-in.js")(socket, users);

});

const { registerRoutes } = require("./routes/routes.js");
registerRoutes(app);
