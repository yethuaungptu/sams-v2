const express = require("express");
const router = express.Router();

const checkStudent = function (req, res, next) {
  if (req.session.student) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkStudent, function (req, res) {
  res.render("student/index");
});

module.exports = router;
