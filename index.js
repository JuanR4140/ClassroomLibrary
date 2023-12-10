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
    
    require("./sockets/sign-in.js")(socket, users);
    
    require("./sockets/search-query.js")(socket, users, books);

    require("./sockets/check-out.js")(socket, users, books);
    require("./sockets/turn-in.js")(socket, users, books);

    require("./sockets/get-checked-out-books.js")(socket, users, books);

    require("./sockets/add-wishlist.js")(socket, users, books);
    require("./sockets/remove-wishlist.js")(socket, users, books);
    require("./sockets/get-wishlist.js")(socket, users, books);

});

const { registerRoutes } = require("./routes/routes.js");
registerRoutes(app);
