var express = require("express");
var router = express.Router();
var Teacher = require("../models/Teacher");
var Student = require("../models/Student");

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

router.post("/tlogin", async function (req, res) {
  const teacher = await Teacher.findOne({ email: req.body.email });
  if (teacher != null && Teacher.compare(req.body.password, teacher.password)) {
    req.session.teacher = {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
    };
    res.redirect("/teacher");
  } else {
    res.redirect("/login");
  }
});

router.post("/slogin", async function (req, res) {
  const student = await Student.findOne({ email: req.body.email });
  if (student != null && Student.compare(req.body.password, student.password)) {
    req.session.student = {
      name: student.name,
      classId: student.classId,
      email: student.email,
      department: student.department,
      roll: student.roll,
      phone: student.phone,
      gender: student.gender,
    };
    res.redirect("/student");
  } else {
    res.redirect("/login");
  }
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
