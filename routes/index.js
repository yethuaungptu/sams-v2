var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/blank", function (req, res, next) {
  res.render("blank", { title: "Express" });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/alogin", function (req, res, next) {
  res.render("alogin");
});

router.post("/alogin", function (req, res) {
  if (
    req.body.email == "sams2024@gmail.com" &&
    req.body.password == "2024sams"
  ) {
    req.session.admin = { name: "Admin", email: "sams2024@gmail.com" };
    res.redirect("/admin");
  } else {
    res.redirect("/alogin");
  }
});
module.exports = router;
