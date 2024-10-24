const path = require("path");

let dir = path.join(__dirname + "/../public/");

const ejsData = {};
const RenderFile = (res, file, data) => {
    let fullEjsData = { ...ejsData, ...data };
    res.render(`${dir}${file}.html`, fullEjsData);
}

let registerRoutes = (app) => {
    app.get("/", (req, res) => {
        RenderFile(res, "index");
    });

    app.get("/home", (req, res) => {
        RenderFile(res, "home");
    });

    app.get("/library", (req, res) => {
        RenderFile(res, "library");
    });

    app.get("/search*", (req, res) => {
        RenderFile(res, "search");
    });

    app.get("/book*", (req, res) => {
        RenderFile(res, "book");
    });

    app.get("/my-books", (req, res) => {
        RenderFile(res, "my-books");
    });

    app.get("/inbox", (req, res) => {
        RenderFile(res, "inbox");
    });

    app.get("/settings", (req, res) => {
        RenderFile(res, "settings");
    });



    app.get("/admin", (req, res) => {
        res.redirect("/admin/login");
    });

    app.get("/admin/login", (req, res) => {
        RenderFile(res, "admin/login");
    });

    app.get("/admin/dashboard", (req, res) => {
        RenderFile(res, "admin/dashboard");
    });

    app.get("/admin/books", (req, res) => {
        RenderFile(res, "admin/books");
    });

    app.get("/admin/books/new", (req, res) => {
        RenderFile(res, "admin/new");
    });

    app.get("/admin/students", (req, res) => {
        RenderFile(res, "admin/students");
    });

    app.get("/admin/mail", (req, res) => {
        RenderFile(res, "admin/mail");
    });

    app.get("/admin/advanced", (req, res) => {
        RenderFile(res, "admin/advanced");
    });

    /*app.get("/admin/library", (req, res) => {
        RenderFile(res, "admin/library");
    });*/

    console.log("All routes registered.");
}

module.exports = {
    registerRoutes
}
