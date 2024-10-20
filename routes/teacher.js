const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Academic = require("../models/Academic");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const mongoose = require("mongoose");
const _ = require("lodash");
var moment = require("moment-timezone");

const normalMonths = [
  { no: 10, name: "November" },
  { no: 11, name: "December" },
  { no: 0, name: "January" },
  { no: 1, name: "February" },
  { no: 2, name: "March" },
  { no: 5, name: "June" },
  { no: 6, name: "July" },
  { no: 7, name: "Auguest" },
  { no: 8, name: "September" },
  { no: 9, name: "October" },
];
const intervalMonths = [
  { no: 5, name: "June" },
  { no: 6, name: "July" },
  { no: 7, name: "Auguest" },
  { no: 8, name: "September" },
  { no: 9, name: "October" },
  { no: 10, name: "November" },
  { no: 11, name: "December" },
  { no: 0, name: "January" },
  { no: 1, name: "February" },
  { no: 2, name: "March" },
];

const checkTeacher = function (req, res, next) {
  if (req.session.teacher) {
    res.locals.teacher = req.session.teacher;
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkTeacher, async function (req, res) {
  const academics = await Academic.find({
    status: true,
    "combination.teacherId": req.session.teacher.id,
  });
  const timetables = await Timetable.find({
    status: true,
    "times.teacherId": req.session.teacher.id,
  });
  let subjectCount = 0;
  let timeCount = 0;
  academics.map((item) => {
    item.combination.map((com) => {
      if (com.teacherId.equals(req.session.teacher.id)) subjectCount++;
    });
  });
  timetables.map((item) => {
    item.times.map((time) => {
      if (time.teacherId.equals(req.session.teacher.id)) timeCount++;
    });
  });
  console.log(academics.length, subjectCount, timeCount);
  res.render("teacher/index", {
    classCount: academics.length,
    subjectCount: subjectCount,
    timeCount: timeCount,
  });
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
  })
    .populate("times.subjectId", "name")
    .populate("classId", "name");
  const list = [];
  const subj = [];
  for (var i = 0; i < timetables.length; i++) {
    let isFill = false;
    for (var j = 0; j < timetables[i].times.length; j++) {
      if (timetables[i].times[j].teacherId.equals(req.session.teacher.id)) {
        if (!isFill) {
          subj.push({
            subjName: timetables[i].times[j].subjectId.name,
            className: timetables[i].classId.name,
          });
          isFill = true;
        }
        list.push(timetables[i].times[j]);
      }
    }
  }
  res.render("teacher/timetable", {
    list: JSON.stringify(list),
    subjList: subj,
  });
});

router.get("/todayattendance", checkTeacher, async function (req, res) {
  var now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("day").format();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("day").format();
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
        timetables[i].times[j].time.charAt(0) == moment(starttz).day()
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

  console.log(starttz, endtz);
  const attendances = await Attendance.find({
    teacherId: req.session.teacher.id,
    created: { $gte: starttz, $lte: endtz },
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

router.get("/callLibraryAttendance", checkTeacher, async function (req, res) {
  try {
    const timetable = await Timetable.findById(req.query.tid);
    const timelist = timetable.times.filter((item) => {
      return (
        item.subjectId.toString() == req.query.sid &&
        item.time.charAt(0) == req.query.day
      );
    });
    const studentList = await Student.find({
      classId: req.query.cid,
      status: true,
    }).select("_id");

    for (var i = 0; i < timelist.length; i++) {
      const list = [];
      studentList.map(({ _id }) =>
        list.push({ isAttendance: true, studentId: _id })
      );
      const attendance = new Attendance();
      attendance.classId = req.query.cid;
      attendance.timetableId = req.query.tid;
      attendance.subjectId = req.query.sid;
      attendance.teacherId = req.session.teacher.id;
      attendance.time = timelist[i].time.charAt(1);
      attendance.day = timelist[i].time.charAt(0);
      attendance.list = list;
      attendance.department = timetable.department;
      const data = await attendance.save();
    }
    res.redirect("/teacher/todayattendance");
  } catch (e) {
    throw e;
  }
});

router.get("/callMultiAttendance", checkTeacher, async function (req, res) {
  try {
    const students = await Student.find({
      classId: req.query.cid,
      status: true,
    }).populate("classId", "name");
    res.render("teacher/callMultiAttendance", {
      status: true,
      students: students,
      query: req.query,
    });
  } catch (e) {
    res.render("teacher/callAttendance", { status: false });
  }
});

router.post("/callMultiAttendance", checkTeacher, async function (req, res) {
  try {
    const multi = JSON.parse(req.body.multi);
    const classData = await Class.findById(req.body.classId);
    for (var i = 0; i < multi.length; i++) {
      const attendance = new Attendance();
      attendance.classId = req.body.classId;
      attendance.timetableId = req.body.timetableId;
      attendance.subjectId = req.body.subjectId;
      attendance.teacherId = req.session.teacher.id;
      attendance.time = multi[i].time;
      attendance.day = req.body.day;
      attendance.list = multi[i].list;
      attendance.department = classData.department;
      const data = await attendance.save();
    }
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
    .populate("combination.subjectId", "name")
    .select("classId combination");
  console.log(classList);
  res.render("teacher/attendance", {
    classList: classList,
    teacherId: req.session.teacher.id,
  });
});

router.get(
  "/viewAttendanceDetail/:id",
  checkTeacher,
  async function (req, res) {
    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const subject = await Subject.findById(req.params.id);
    const studentList = await Student.find({
      classId: subject.classId,
    }).populate("classId");
    const data = await Attendance.aggregate([
      { $match: { subjectId: id } },
      {
        $group: {
          _id: { month: "$month", studentId: "$list.studentId" },
          list: { $push: "$$ROOT" },
        },
      },
    ]);

    const attendanceList = [];
    data.map((item) => {
      const studentIdList = item._id.studentId;
      let stuAttendance = [];
      studentIdList.map((itemStu) => {
        stuAttendance.push({ studentId: itemStu, attCount: 0, totalCount: 0 });
      });
      const month = item._id.month;
      item.list.map((innerItem) => {
        innerItem.list.map((attendance) => {
          studentIdList.map((itemId) => {
            let objIndex = stuAttendance.findIndex(
              (obj) => obj.studentId == itemId
            );

            if (itemId.toString() == attendance.studentId.toString()) {
              stuAttendance[objIndex].totalCount += 1;
              if (attendance.isAttendance) {
                stuAttendance[objIndex].attCount += 1;
              }
            }
          });
        });
      });
      attendanceList.push({ month: month, stuAttendance: stuAttendance });
    });
    res.render("teacher/viewAttendanceDetail", {
      studentList: studentList,
      attendanceList: attendanceList,
      subject: subject,
    });
  }
);

router.get(
  "/viewAttendanceDetailByMonth/:id",
  checkTeacher,
  async function (req, res) {
    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const subject = await Subject.findById(req.params.id);
    const classData = await Class.findById(subject.classId);
    const studentList = await Student.find({
      classId: subject.classId,
      status: true,
    }).populate("classId");
    const data = await Attendance.aggregate([
      { $match: { subjectId: id } },
      {
        $group: {
          _id: { month: "$month", studentId: "$list.studentId" },
          list: { $push: "$$ROOT" },
        },
      },
    ]);
    const attendanceList = [];
    data.map((item) => {
      const studentIdList = item._id.studentId;
      let stuAttendance = [];
      studentIdList.map((itemStu) => {
        stuAttendance.push({
          studentId: itemStu,
          attCount: 0,
          totalCount: 0,
          list: [],
        });
      });
      const month = item._id.month;
      item.list.map((innerItem) => {
        innerItem.list.map((attendance) => {
          studentIdList.map((itemId) => {
            let objIndex = stuAttendance.findIndex(
              (obj) => obj.studentId == itemId
            );
            if (itemId.toString() == attendance.studentId.toString()) {
              stuAttendance[objIndex].totalCount += 1;

              stuAttendance[objIndex].list.push({
                date: moment(innerItem.created).format("DD/MM/YYYY"),
                attCount: attendance.isAttendance ? 1 : 0,
                totalCount: 1,
                time: innerItem.time,
              });
              if (attendance.isAttendance) {
                stuAttendance[objIndex].attCount += 1;
              }
            }
          });
        });
      });
      attendanceList.push({ month: month, stuAttendance: stuAttendance });
    });

    const monthList = classData.isInterval ? intervalMonths : normalMonths;

    res.render("teacher/viewAttendanceDetailByMonth", {
      studentList: studentList,
      attendanceList: attendanceList,
      subject: subject,
      monthList: monthList,
    });
  }
);

router.get("/allAttendance", checkTeacher, async function (req, res) {
  const teacher = await Teacher.findById(req.session.teacher.id);
  var reg = new RegExp(String.raw`${teacher.familyClass}`, "i");
  const classList = await Class.find({
    name: reg,
    status: true,
    department: teacher.department,
  });
  res.render("teacher/allAttendance", { classList: classList });
});

router.get(
  "/viewAllAttendanceDetail/:id",
  checkTeacher,
  async function (req, res) {
    const subjects = await Subject.find({
      classId: req.params.id,
      status: true,
      name: { $ne: "Library" },
    });
    const id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const students = await Student.find({ classId: id, status: true }).populate(
      "classId"
    );
    const data = await Attendance.aggregate([
      { $match: { classId: id } },
      {
        $group: {
          _id: {
            month: "$month",
            subjectId: "$subjectId",
          },
          list: { $push: "$$ROOT" },
        },
      },
    ]);
    const result = _.groupBy(data, function (n) {
      return n._id.subjectId;
    });
    res.render("teacher/viewAllAttendanceDetail", {
      attendanceList: result,
      subjects: subjects,
      students: students,
    });
  }
);

router.get(
  "/viewAllAttendanceDetailByMonth/:id",
  checkTeacher,
  async function (req, res) {
    const subjects = await Subject.find({
      classId: req.params.id,
      status: true,
    });
    const classData = await Class.findById(req.params.id);
    const id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const students = await Student.find({ classId: id, status: true }).populate(
      "classId"
    );
    const data = await Attendance.aggregate([
      { $match: { classId: id } },
      {
        $group: {
          _id: {
            month: "$month",
            subjectId: "$subjectId",
          },
          list: { $push: "$$ROOT" },
        },
      },
    ]);

    const result = _.groupBy(data, function (n) {
      return n._id.month;
    });
    const monthList = classData.isInterval ? intervalMonths : normalMonths;
    res.render("teacher/viewAllAttendanceDetailByMonth", {
      attendanceList: result,
      subjects: subjects,
      students: students,
      monthList: monthList,
    });
  }
);

router.get("/searchAttendance", checkTeacher, async function (req, res) {
  const teacher = await Teacher.findById(req.session.teacher.id);
  let classData;
  if (teacher.familyClass === "IBE") {
    classData = await Class.findOne({
      isInterval: true,
      department: req.session.teacher.department,
    });
  } else {
    var reg = new RegExp(String.raw`${teacher.familyClass}`, "i");
    classData = await Class.findOne({
      name: reg,
      status: true,
      department: teacher.department,
    });
  }
  const subjectList = await Subject.find({
    status: true,
    classId: classData._id,
    name: { $ne: "Library" },
  });
  res.render("teacher/searchAttendance", { subjectList: subjectList });
});

router.post("/getAttendanceList", checkTeacher, async function (req, res) {
  try {
    var now = new Date(req.body.attDate);
    const starttz = moment.utc(now).tz("Asia/Yangon").startOf("day").format();
    const endtz = moment.utc(now).tz("Asia/Yangon").endOf("day").format();
    const attendances = await Attendance.find({
      status: true,
      subjectId: req.body.subjectId,
      created: { $gte: starttz, $lte: endtz },
    })
      .populate("classId", "name")
      .populate("subjectId", "name");
    console.log(attendances);
    res.json({ status: true, attendances: attendances });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/logout", checkTeacher, async function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
