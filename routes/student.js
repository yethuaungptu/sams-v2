const express = require("express");
const Student = require("../models/Student");
const Timetable = require("../models/Timetable");
const Academic = require("../models/Academic");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const checkStudent = function (req, res, next) {
  if (req.session.student) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkStudent, async function (req, res) {
  res.render("student/index");
});

router.get("/profile", checkStudent, async function (req, res) {
  const student = await Student.findById(req.session.student.id);
  console.log(student);
  res.render("student/profile", { student: student });
});

router.post("/profileCheckAndUpdate", checkStudent, async function (req, res) {
  const student = await Student.findById(req.session.student.id);
  const oldPassCheck = await Student.compare(
    req.body.oldPass,
    student.password
  );
  if (oldPassCheck) {
    const update = {
      password: bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(8), null),
    };
    const data = await Student.findByIdAndUpdate(req.body.id, update);
    res.json({ status: true });
  } else {
    res.json({ status: false, msg: "Old password not match" });
  }
});

router.get("/timetable", checkStudent, async function (req, res) {
  const timetable = await Timetable.findOne({
    classId: req.session.student.classId,
    status: true,
  })
    .populate("times.subjectId", "name")
    .populate("classId", "name");
  const academic = await Academic.findById(timetable.academicId)
    .populate("combination.subjectId", "name code")
    .populate("combination.teacherId", "name");
  const teachers = await Teacher.find(
    {
      status: true,
      isFamily: true,
      department: req.session.student.department,
    },
    { _id: 0, name: 1, familyClass: 1 }
  );
  console.log(teachers);
  res.render("student/timetable", {
    timetable: timetable,
    academic: academic,
    teachers: teachers,
    department: req.session.student.department,
  });
});

router.get("/attendance", checkStudent, async function (req, res) {
  const subjects = await Subject.find({
    classId: req.session.student.classId,
    status: true,
    name: { $ne: "Library" },
  });
  let id = mongoose.Types.ObjectId.createFromHexString(
    req.session.student.classId
  );
  const data = await Attendance.aggregate([
    { $match: { classId: id } },
    {
      $group: {
        _id: { month: "$month", subjectId: "$subjectId" },
        list: { $push: "$$ROOT" },
      },
    },
  ]);
  const attendanceList = [];
  data.map((item) => {
    let totalCount = 0;
    let attCount = 0;
    item.list.map((att) => {
      totalCount++;
      const attList = att.list.filter((student) => {
        return (
          student.studentId.toString() == req.session.student.id.toString()
        );
      });
      if (attList[0].isAttendance) attCount++;
    });
    attendanceList.push({
      month: item._id.month,
      subjectId: item._id.subjectId,
      totalCount,
      attCount,
    });
  });
  res.render("student/attendance", {
    subjects: subjects,
    attendanceList: attendanceList,
  });
});

router.get("/logout", checkStudent, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/login");
  });
});

module.exports = router;
