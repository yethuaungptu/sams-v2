const express = require("express");
const router = express.Router();

const checkTeacher = function (req, res, next) {
  if (req.session.teacher) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkTeacher, function (req, res) {
  res.render("teacher/index");
});

module.exports = router;
