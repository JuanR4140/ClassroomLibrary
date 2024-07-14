const { logger } = require("./system/logger.js");
logger.log("[INFO] SYSTEM is initializing all core components..");

require("dotenv").config();
const ejs = require("ejs");
const express = require("express");
const helmet = require("helmet");

const { db, books, users, teacher_picks, email_queue, miscellaneous, bucket } = require("./firebase/firebase.js");

const PORT = 3000;

const app = express();

app.disable("x-powered-by");

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

    
    require("./sockets/user/sign-in.js")(socket, users, miscellaneous);
    require("./sockets/user/search-query.js")(socket, users, books);
    // require("./sockets/user/check-out.js")(socket, users, books, email_queue);
    // require("./sockets/user/turn-in.js")(socket, users, books, email_queue);
    require("./sockets/user/extend-return-date.js")(socket, users, books, email_queue);
    require("./sockets/user/get-checked-out-books.js")(socket, users, books);
    require("./sockets/user/add-wishlist.js")(socket, users, books);
    require("./sockets/user/remove-wishlist.js")(socket, users, books);
    require("./sockets/user/get-wishlist.js")(socket, users, books);
    require("./sockets/user/get-mail.js")(socket, users);
    require("./sockets/user/mark-read.js")(socket, users);
    require("./sockets/user/delete-mail.js")(socket, users);
    require("./sockets/user/get-teacher-picks.js")(socket, users, teacher_picks);
    require("./sockets/user/get-new-acquires.js")(socket, users, books);
    require("./sockets/user/get-all-books.js")(socket, users, books);


    require("./sockets/admin/admin-check-out.js")(socket, users, books, email_queue);
    require("./sockets/admin/admin-turn-in.js")(socket, users, books, email_queue);
    require("./sockets/admin/admin-sign-in.js")(socket, users);
    require("./sockets/admin/admin-add-book.js")(socket, users, books, bucket);
    require("./sockets/admin/admin-remove-book.js")(socket, users, books, bucket);
    require("./sockets/admin/admin-view-logs.js")(socket, users);
    require("./sockets/admin/admin-clear-logs.js")(socket, users);
    require("./sockets/admin/admin-get-all-books.js")(socket, users, books);
    require("./sockets/admin/book-exists.js")(socket, books);
    require("./sockets/admin/admin-delete-book-review.js")(socket, users, books);
    require("./sockets/admin/admin-send-mail.js")(socket, users);
    require("./sockets/admin/admin-view-students.js")(socket, users, books);
    require("./sockets/admin/admin-delete-student.js")(socket, users);
    require("./sockets/admin/admin-force-return-book.js")(socket, users, books, email_queue);
    require("./sockets/admin/admin-add-to-teacher-picks.js")(socket, users, books, teacher_picks);
    require("./sockets/admin/admin-get-teacher-picks.js")(socket, users, teacher_picks);
    require("./sockets/admin/admin-remove-from-teacher-picks.js")(socket, users, teacher_picks);
    require("./sockets/admin/admin-get-pin-status.js")(socket, users, miscellaneous);
    require("./sockets/admin/admin-set-pin-status.js")(socket, users, miscellaneous)
});

const { registerDueBookNoticeChecks } = require("./system/schedulers.js");
registerDueBookNoticeChecks(users, email_queue);

const { registerRoutes } = require("./routes/routes.js");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
registerRoutes(app);

app.use(cookieParser());
app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false
}));
app.use(csurf({ cookie: true }));
app.use(helmet());
