const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Academic = require("../models/Academic");
const Class = require("../models/Class");

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

router.get("/todayattendance", checkTeacher, async function (req, res) {
  const d = new Date();
  const timetables = await Timetable.find({
    status: true,
    times: { $elemMatch: { teacherId: req.session.teacher.id } },
  })
    .populate("times.subjectId", "name")
    .populate("classId", "name");
  const list = [];
  for (var i = 0; i < timetables.length; i++) {
    let subList = [];
    for (var j = 0; j < timetables[i].times.length; j++) {
      if (
        timetables[i].times[j].teacherId.equals(req.session.teacher.id) &&
        timetables[i].times[j].time.charAt(0) == d.getDay()
      ) {
        subList.push(timetables[i].times[j]);
      }
    }
    if (subList.length > 0)
      list.push({
        class: timetables[i].classId,
        subList: subList,
        timetableId: timetables[i]._id,
      });
  }
  var now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(start);
  const attendances = await Attendance.find({
    teacherId: req.session.teacher.id,
    created: { $gte: start },
    status: true,
  })
    .populate("classId", "name")
    .populate("subjectId", "name");
  res.render("teacher/todayAttendance", {
    list: list,
    attendances: attendances,
  });
});

router.get("/callAttendance", checkTeacher, async function (req, res) {
  try {
    const students = await Student.find({
      classId: req.query.cid,
      status: true,
    }).populate("classId", "name");
    res.render("teacher/callAttendance", {
      status: true,
      students: students,
      query: req.query,
    });
  } catch (e) {
    res.render("teacher/callAttendance", { status: false });
  }
});

router.post("/callAttendance", checkTeacher, async function (req, res) {
  try {
    const list = JSON.parse(req.body.list);
    const classData = await Class.findById(req.body.classId);
    const attendance = new Attendance();
    attendance.classId = req.body.classId;
    attendance.timetableId = req.body.timetableId;
    attendance.subjectId = req.body.subjectId;
    attendance.teacherId = req.session.teacher.id;
    attendance.time = req.body.time;
    attendance.day = req.body.day;
    attendance.list = list;
    attendance.department = classData.department;
    const data = await attendance.save();
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/attendanceDetail/:id", checkTeacher, async function (req, res) {
  const attendance = await Attendance.findById(req.params.id)
    .populate("list.studentId", "name department roll")
    .populate("classId", "name");
  res.render("teacher/attendanceDetail", { attendance: attendance });
});

router.get("/attendance", checkTeacher, async function (req, res) {
  const classList = await Academic.find({
    status: true,
    combination: { $elemMatch: { teacherId: req.session.teacher.id } },
  })
    .populate("classId", "name")
    .select("classId");
  console.log(classList);
  res.render("teacher/attendance", { classList: classList });
});

router.get("/logout", checkTeacher, async function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
