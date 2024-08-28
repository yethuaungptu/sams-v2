const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const Timetables = require("../models/Timetable");
const bcrypt = require("bcryptjs");
const Timetable = require("../models/Timetable");

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

router.get("/profile", checkTeacher, async function (req, res) {
  const teacher = await Teacher.findById(req.session.teacher.id);
  console.log(teacher);
  res.render("teacher/profile", { teacher: teacher });
});

router.post("/profileCheckAndUpdate", checkTeacher, async function (req, res) {
  const teacher = await Teacher.findById(req.session.teacher.id);
  const oldPassCheck = await Teacher.compare(
    req.body.oldPass,
    teacher.password
  );
  if (oldPassCheck) {
    const update = {
      password: bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(8), null),
    };
    const data = await Teacher.findByIdAndUpdate(req.body.id, update);
    res.json({ status: true });
  } else {
    res.json({ status: false, msg: "Old password not match" });
  }
});

router.get("/timetable", checkTeacher, async function (req, res) {
  console.log(req.session.teacher.id);
  const timetables = await Timetable.find({
    status: true,
    times: { $elemMatch: { teacherId: req.session.teacher.id } },
  }).populate("times.subjectId", "name");
  const list = [];
  for (var i = 0; i < timetables.length; i++) {
    for (var j = 0; j < timetables[i].times.length; j++) {
      if (timetables[i].times[j].teacherId.equals(req.session.teacher.id)) {
        list.push(timetables[i].times[j]);
      }
    }
  }
  res.render("teacher/timetable", { list: JSON.stringify(list) });
});

router.get("/logout", checkTeacher, async function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
