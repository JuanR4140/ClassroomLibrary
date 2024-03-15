const { logger } = require("./system/logger.js");
logger.log("[INFO] SYSTEM is initializing all core components..");

require("dotenv").config();
const ejs = require("ejs");
const express = require("express");

const { db, books, users, email_queue, bucket } = require("./firebase/firebase.js");

const PORT = 3000;

const app = express();

app.engine("html", ejs.renderFile);
app.use(express.static("./public"));

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}! 🚀`);
    logger.log("[INFO] SYSTEM intialized all core components. Ready for requests!");
});

const io = require("socket.io")(server);

io.on("connection", (socket) => {

    require("./sockets/ping.js")(socket, users);
    require("./sockets/admin-ping.js")(socket, users);

    
    require("./sockets/user/sign-in.js")(socket, users);
    require("./sockets/user/search-query.js")(socket, users, books);
    require("./sockets/user/check-out.js")(socket, users, books, email_queue);
    require("./sockets/user/turn-in.js")(socket, users, books, email_queue);
    require("./sockets/user/extend-return-date.js")(socket, users, books, email_queue);
    require("./sockets/user/get-checked-out-books.js")(socket, users, books);
    require("./sockets/user/add-wishlist.js")(socket, users, books);
    require("./sockets/user/remove-wishlist.js")(socket, users, books);
    require("./sockets/user/get-wishlist.js")(socket, users, books);
    require("./sockets/user/get-mail.js")(socket, users);
    require("./sockets/user/mark-read.js")(socket, users);
    require("./sockets/user/delete-mail.js")(socket, users);


    require("./sockets/admin/admin-sign-in.js")(socket, users);
    require("./sockets/admin/admin-add-book.js")(socket, users, books, bucket);
    require("./sockets/admin/admin-remove-book.js")(socket, users, books, bucket);
    require("./sockets/admin/admin-view-logs.js")(socket, users);
    require("./sockets/admin/admin-clear-logs.js")(socket, users);
    require("./sockets/admin/admin-get-all-books.js")(socket, users, books);
    require("./sockets/admin/book-exists.js")(socket, books);
    require("./sockets/admin/admin-delete-book-review.js")(socket, users, books);

});

const { registerDueBookNoticeChecks } = require("./system/schedulers.js");
registerDueBookNoticeChecks(users, email_queue);

const { registerRoutes } = require("./routes/routes.js");
registerRoutes(app);
