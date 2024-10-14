var express = require("express");
var bcrypt = require("bcryptjs");
var router = express.Router();
const Class = require("../../models/Class");
const Teacher = require("../../models/Teacher");
const Student = require("../../models/Student");
const Subject = require("../../models/Subject");
const Academic = require("../../models/Academic");
const Timetable = require("../../models/Timetable");

/* GET users listing. */
const deptList = [
  "IT",
  "EC",
  "EP",
  "Civil",
  "MP",
  "Eng",
  "Math",
  "Myan",
  "Phy",
  "Chem",
];
const deptArr = [
  { key: "IT", name: "Information Technology", type: "major" },
  { key: "Civil", name: "Civil", type: "major" },
  { key: "EC", name: "Electronic", type: "major" },
  { key: "EP", name: "Electrical Power", type: "major" },
  { key: "MP", name: "Mechanical Power", type: "major" },
  { key: "Eng", name: "English", type: "minor" },
  { key: "Myan", name: "Myanmar", type: "minor" },
  { key: "Math", name: "Mathematic", type: "minor" },
  { key: "Phy", name: "Physics", type: "minor" },
  { key: "Chem", name: "Chemistry", type: "minor" },
];
const checkDept = function (req, res, next) {
  if (deptList.includes(req.params.dept)) {
    const deptData = deptArr.filter((d) => d["key"] === req.params.dept);
    req.session.dept = deptData[0];
    res.locals.dept = deptData[0];
    next();
  } else {
    res.redirect("/admin/departments");
  }
};

router.get("/", async function (req, res, next) {
  const teacherInfo = await Teacher.aggregate([
    {
      $match: { status: true },
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
  ]);
  const classInfo = await Class.aggregate([
    {
      $match: { status: true },
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
  ]);
  const studentInfo = await Student.aggregate([
    {
      $match: { status: true },
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
  ]);
  res.render("admin/department/index", {
    teacherInfo: teacherInfo,
    classInfo: classInfo,
    studentInfo: studentInfo,
  });
});

router.get("/:dept", checkDept, async function (req, res) {
  const deptData = deptArr.filter((d) => d["key"] === req.params.dept);
  console.log(deptData);
  const academicCount = await Academic.countDocuments({
    status: true,
    department: req.params.dept,
  });
  const classCount = await Class.countDocuments({
    status: true,
    department: req.params.dept,
  });
  const teacherCount = await Teacher.countDocuments({
    status: true,
    department: req.params.dept,
  });
  const studentCount = await Student.countDocuments({
    status: true,
    department: req.params.dept,
  });
  const subjectCount = await Subject.countDocuments({
    status: true,
    department: req.params.dept,
  });
  const timetableCount = await Timetable.countDocuments({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/detail", {
    academicCount: academicCount,
    classCount: classCount,
    teacherCount: teacherCount,
    studentCount: studentCount,
    subjectCount: subjectCount,
    timetableCount: timetableCount,
  });
});

router.get("/:dept/class", checkDept, async function (req, res) {
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/class", { classes: classes });
});

router.get("/:dept/class/add", checkDept, function (req, res) {
  res.render("admin/department/class/add");
});

router.post("/:dept/class/check", checkDept, async function (req, res) {
  const data = await Class.findOne({
    name: req.body.name,
    department: req.params.dept,
    status: true,
  });
  data == null ? res.json({ status: true }) : res.json({ status: false });
});

router.post("/:dept/class/add", checkDept, async function (req, res) {
  const classes = new Class();
  classes.name = req.body.name;
  classes.department = req.params.dept;
  if (req.body.isInterval) classes.isInterval = true;
  const data = await classes.save();
  console.log(data);
  res.redirect("/admin/departments/" + req.params.dept + "/class");
});

router.post("/:dept/class/checkWithId", checkDept, async function (req, res) {
  const data = await Class.findOne({
    name: req.body.name,
    department: req.params.dept,
    status: true,
    _id: { $ne: req.body.id },
  });
  data == null ? res.json({ status: true }) : res.json({ status: false });
});

router.post("/:dept/class/update", checkDept, async function (req, res) {
  const update = {
    name: req.body.name,
  };
  if (req.body.isInterval) update.isInterval = true;
  else update.isInterval = false;
  const data = await Class.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/class");
});

router.get("/:dept/class/delete/:id", checkDept, async function (req, res) {
  const data = await Class.findByIdAndUpdate(req.params.id, { status: false });
  res.redirect("/admin/departments/" + req.params.dept + "/class");
});

router.get("/:dept/teacher", checkDept, async function (req, res) {
  const teachers = await Teacher.find({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/teacher", { teachers: teachers });
});

router.get("/:dept/teacher/add", checkDept, async function (req, res) {
  const teachers = await Teacher.find({
    status: true,
    isFamily: true,
    department: req.params.dept,
  });
  const insertYear = [];
  teachers.map((item) => insertYear.push(item.familyClass));
  res.render("admin/department/teacher/add", { insertYear: insertYear });
});

router.post("/:dept/teacher/check", checkDept, async function (req, res) {
  const data = await Teacher.findOne({ status: true, email: req.body.email });
  data == null ? res.json({ status: true }) : res.json({ status: false });
});

router.post("/:dept/teacher/add", checkDept, async function (req, res) {
  const teacher = new Teacher();
  teacher.name = req.body.name;
  teacher.email = req.body.email;
  teacher.password = req.body.password;
  teacher.address = req.body.address;
  teacher.phone = req.body.phone;
  teacher.department = req.params.dept;
  if (req.body.isFamily) {
    teacher.isFamily = true;
    teacher.familyClass = req.body.year;
  }
  const data = await teacher.save();
  res.redirect("/admin/departments/" + req.params.dept + "/teacher");
});

router.get("/:dept/teacher/detail/:id", checkDept, async function (req, res) {
  const teacher = await Teacher.findById(req.params.id);
  res.render("admin/department/teacher/detail", { teacher: teacher });
});

router.get("/:dept/teacher/update/:id", checkDept, async function (req, res) {
  const teacher = await Teacher.findById(req.params.id);
  const teachers = await Teacher.find({
    status: true,
    isFamily: true,
    _id: { $ne: req.params.id },
    department: req.params.dept,
  });
  const insertYear = [];
  teachers.map((item) => insertYear.push(item.familyClass));
  res.render("admin/department/teacher/update", {
    teacher: teacher,
    insertYear: insertYear,
  });
});

router.post("/:dept/teacher/update", checkDept, async function (req, res) {
  const update = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
  };
  if (req.body.password)
    update.password = bcrypt.hashSync(
      req.body.password,
      bcrypt.genSaltSync(8),
      null
    );
  if (req.body.isFamily) {
    update.isFamily = true;
    update.familyClass = req.body.year;
  } else {
    update.isFamily = false;
    update.familyClass = "";
  }
  const data = await Teacher.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/teacher/");
});

router.get("/:dept/teacher/delete/:id", checkDept, async function (req, res) {
  const update = { status: false };
  const data = await Teacher.findByIdAndUpdate(req.params.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/teacher");
});

router.get("/:dept/student", checkDept, async function (req, res) {
  // const students = await Student.find({
  //   status: true,
  //   department: req.params.dept,
  // }).populate("classId", "name");

  const students = await Student.aggregate([
    { $match: { status: true, department: req.params.dept } },
    {
      $group: {
        _id: "$classId",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "_id",
        foreignField: "_id",
        as: "classId",
      },
    },
    { $unwind: { path: "$classId" } },
  ]);
  console.log(students);
  res.render("admin/department/student", { students: students });
});

router.get("/:dept/student/list/:id", checkDept, async function (req, res) {
  const students = await Student.find({
    status: true,
    department: req.params.dept,
    classId: req.params.id,
  }).populate("classId", "name");
  res.render("admin/department/student/list", { students: students });
});

router.get("/:dept/student/add", checkDept, async function (req, res) {
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/student/add", { classes: classes });
});

router.post("/:dept/student/check", checkDept, async function (req, res) {
  const emailCheck = await Student.findOne({
    status: true,
    email: req.body.email,
  });
  const rollCheck = await Student.findOne({
    status: true,
    department: req.params.dept,
    roll: req.body.roll,
    classId: req.body.classId,
  });
  if (emailCheck == null && rollCheck == null) {
    res.json({ status: true });
  } else if (emailCheck != null) {
    res.json({ status: false, msg: "Email is duplicate" });
  } else if (rollCheck != null) {
    res.json({ status: false, msg: "Roll No is already inserted" });
  }
});

router.post("/:dept/student/checkWithId", checkDept, async function (req, res) {
  const rollCheck = await Student.findOne({
    status: true,
    department: req.params.dept,
    roll: req.body.roll,
    classId: req.body.classId,
    _id: { $ne: req.body.id },
  });
  if (rollCheck == null) {
    res.json({ status: true });
  } else {
    res.json({ status: false, msg: "Roll No is already inserted" });
  }
});

router.post("/:dept/student/add", checkDept, async function (req, res) {
  const student = new Student();
  student.name = req.body.name;
  student.email = req.body.email;
  student.password = req.body.password;
  student.roll = req.body.roll;
  student.classId = req.body.classId;
  student.gender = req.body.gender;
  student.phone = req.body.phone;
  student.department = req.params.dept;
  const data = await student.save();
  res.redirect("/admin/departments/" + req.params.dept + "/student");
});

router.get("/:dept/student/detail/:id", checkDept, async function (req, res) {
  const student = await Student.findById(req.params.id).populate(
    "classId",
    "name"
  );
  res.render("admin/department/student/detail", { student: student });
});

router.get("/:dept/student/update/:id", checkDept, async function (req, res) {
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
  });
  const student = await Student.findById(req.params.id).populate(
    "classId",
    "name"
  );
  res.render("admin/department/student/update", {
    student: student,
    classes: classes,
  });
});

router.post("/:dept/student/update", checkDept, async function (req, res) {
  const update = {
    name: req.body.name,
    roll: req.body.roll,
    classId: req.body.classId,
    gender: req.body.gender,
    phone: req.body.phone,
  };
  if (req.body.password)
    update.password = bcrypt.hashSync(
      req.body.password,
      bcrypt.genSaltSync(8),
      null
    );
  const student = await Student.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/student");
});

router.get("/:dept/student/delete/:id", checkDept, async function (req, res) {
  const student = await Student.findByIdAndUpdate(req.params.id, {
    status: false,
  });
  res.redirect("/admin/departments/" + req.params.dept + "/student");
});

router.get("/:dept/subject", checkDept, async function (req, res) {
  // const subjects = await Subject.find({
  //   status: true,
  //   department: req.params.dept,
  // }).populate("classId", "name");
  const subjects = await Subject.aggregate([
    { $match: { status: true, department: req.params.dept } },
    {
      $group: {
        _id: "$classId",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "_id",
        foreignField: "_id",
        as: "classId",
      },
    },
    { $unwind: { path: "$classId" } },
  ]);
  res.render("admin/department/subject", { subjects: subjects });
});

router.get("/:dept/subject/list/:id", checkDept, async function (req, res) {
  const subjects = await Subject.find({
    status: true,
    department: req.params.dept,
    classId: req.params.id,
  }).populate("classId", "name");
  res.render("admin/department/subject/list", { subjects: subjects });
});

router.get("/:dept/subject/add", checkDept, async function (req, res) {
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/subject/add", { classes: classes });
});

router.post("/:dept/subject/check", checkDept, async function (req, res) {
  const subject = await Subject.findOne({
    status: true,
    department: req.params.dept,
    code: req.body.code,
    classId: req.body.classId,
  });
  subject == null ? res.json({ status: true }) : res.json({ status: false });
});

router.post("/:dept/subject/add", checkDept, async function (req, res) {
  const subject = new Subject();
  subject.name = req.body.name;
  subject.code = req.body.code;
  subject.classId = req.body.classId;
  subject.department = req.params.dept;
  const data = await subject.save();
  res.redirect("/admin/departments/" + req.params.dept + "/subject");
});

router.get("/:dept/subject/detail/:id", checkDept, async function (req, res) {
  const subject = await Subject.findById(req.params.id).populate(
    "classId",
    "name"
  );
  res.render("admin/department/subject/detail", {
    subject: subject,
  });
});

router.get("/:dept/subject/update/:id", checkDept, async function (req, res) {
  const subject = await Subject.findById(req.params.id);
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
  });
  res.render("admin/department/subject/update", {
    subject: subject,
    classes: classes,
  });
});

router.post("/:dept/subject/checkWithId", checkDept, async function (req, res) {
  const subject = await Subject.findOne({
    status: true,
    department: req.params.dept,
    code: req.body.code,
    classId: req.body.classId,
    _id: { $ne: req.body.id },
  });
  subject == null ? res.json({ status: true }) : res.json({ status: false });
});

router.post("/:dept/subject/update", checkDept, async function (req, res) {
  const update = {
    name: req.body.name,
    code: req.body.code,
    classId: req.body.classId,
  };
  const data = await Subject.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/subject");
});

router.get("/:dept/subject/delete/:id", checkDept, async function (req, res) {
  const data = await Subject.findByIdAndUpdate(req.params.id, {
    status: false,
  });
  res.redirect("/admin/departments/" + req.params.dept + "/subject");
});

router.get("/:dept/academic", checkDept, async function (req, res) {
  const academics = await Academic.find({
    status: true,
    department: req.params.dept,
  }).populate("classId", "name");
  res.render("admin/department/academic", { academics: academics });
});

router.get("/:dept/academic/add", checkDept, async function (req, res) {
  const academic = await Academic.find({
    status: true,
    department: req.params.dept,
  }).select("classId");
  let list = [];
  console.log(academic);
  academic.map((item) => list.push(item.classId));
  const classes = await Class.find({
    status: true,
    department: req.params.dept,
    _id: { $nin: list },
  });
  res.render("admin/department/academic/add", { classes: classes });
});

router.post("/:dept/academic/getSubj", checkDept, async function (req, res) {
  const subjects = await Subject.find({
    status: true,
    classId: req.body.classId,
  });
  res.json({ subjects: subjects });
});

router.post("/:dept/academic/getTeacher", checkDept, async function (req, res) {
  const teachers = await Teacher.find({
    status: true,
    department: req.body.department,
  });
  res.json({ teachers: teachers });
});

router.post("/:dept/academic/add", checkDept, async function (req, res) {
  const academic = new Academic();
  try {
    academic.name = req.body.name;
    academic.fromYear = req.body.fromYear;
    academic.toYear = req.body.toYear;
    academic.classId = req.body.classId;
    academic.department = req.params.dept;
    academic.combination = JSON.parse(req.body.subjectList);
    const data = await academic.save();
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/:dept/academic/detail/:id", checkDept, async function (req, res) {
  const academic = await Academic.findById(req.params.id)
    .populate("classId", "name")
    .populate("combination.teacherId", "name")
    .populate("combination.subjectId", "name");
  res.render("admin/department/academic/detail", { academic: academic });
});

router.get("/:dept/academic/update/:id", checkDept, async function (req, res) {
  const academic = await Academic.findById(req.params.id).populate(
    "classId",
    "name"
  );
  const subjects = await Subject.find({
    status: true,
    classId: academic.classId,
  });
  res.render("admin/department/academic/update", {
    academic: academic,
    subjects: subjects,
  });
});

router.post("/:dept/academic/update", checkDept, async function (req, res) {
  const academic = new Academic();
  try {
    const update = {
      name: req.body.name,
      fromYear: req.body.fromYear,
      toYear: req.body.toYear,
      combination: JSON.parse(req.body.subjectList),
    };

    const data = await Academic.findByIdAndUpdate(req.body.id, update);
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/:dept/academic/delete/:id", checkDept, async function (req, res) {
  const update = {
    status: false,
  };
  const data = await Academic.findByIdAndUpdate(req.params.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/academic");
});

router.get("/:dept/timetable", checkDept, async function (req, res) {
  const timetables = await Timetable.find({
    status: true,
    department: req.params.dept,
  })
    .populate("academicId", "name")
    .populate("classId", "name");
  res.render("admin/department/timetable", { timetables: timetables });
});

router.get("/:dept/timetable/add", checkDept, async function (req, res) {
  const timetable = await Timetable.find({
    status: true,
    department: req.params.dept,
  }).select("academicId");
  let list = [];
  timetable.map((item) => list.push(item.academicId));
  const academics = await Academic.find({
    status: true,
    department: req.params.dept,
    _id: { $nin: list },
  }).populate("combination.subjectId", "name");
  res.render("admin/department/timetable/add", { academics: academics });
});

router.post("/:dept/timetable/add", checkDept, async function (req, res) {
  try {
    const timetable = new Timetable();
    timetable.academicId = req.body.academicId;
    timetable.building = req.body.building;
    timetable.room = req.body.room;
    timetable.classId = req.body.classId;
    timetable.department = req.params.dept;
    timetable.times = JSON.parse(req.body.times);
    const data = await timetable.save();
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/:dept/timetable/detail/:id", checkDept, async function (req, res) {
  const timetable = await Timetable.findById(req.params.id)
    .populate("times.subjectId", "name")
    .populate("classId", "name");
  const academic = await Academic.findById(timetable.academicId)
    .populate("combination.subjectId", "name code")
    .populate("combination.teacherId", "name");
  const teachers = await Teacher.find(
    {
      status: true,
      isFamily: true,
      department: req.params.dept,
    },
    { _id: 0, name: 1, familyClass: 1 }
  );
  console.log(teachers);
  res.render("admin/department/timetable/detail", {
    timetable: timetable,
    academic: academic,
    teachers: teachers,
  });
});

router.get("/:dept/timetable/update/:id", checkDept, async function (req, res) {
  const timetable = await Timetable.findById(req.params.id).populate(
    "times.subjectId",
    "name"
  );
  const academic = await Academic.findById(timetable.academicId).populate(
    "combination.subjectId",
    "name"
  );
  res.render("admin/department/timetable/update", {
    academic: academic,
    timetable: timetable,
  });
});

router.post("/:dept/timetable/update", checkDept, async function (req, res) {
  try {
    const update = {
      building: req.body.building,
      room: req.body.room,
      times: JSON.parse(req.body.times),
    };
    const data = await Timetable.findByIdAndUpdate(req.body.id, update);
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false });
  }
});

router.get("/:dept/timetable/delete/:id", checkDept, async function (req, res) {
  const data = await Timetable.findByIdAndUpdate(req.params.id, {
    status: false,
  });
  res.redirect("/admin/departments/" + req.params.dept + "/timetable");
});

module.exports = router;
