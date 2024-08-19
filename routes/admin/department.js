var express = require("express");
var bcrypt = require("bcryptjs");
var router = express.Router();
const Class = require("../../models/Class");
const Teacher = require("../../models/Teacher");

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
  { key: "MP", name: "Michemical Power", type: "major" },
  { key: "Eng", name: "English", type: "minor" },
  { key: "Myan", name: "Myanmar", type: "minor" },
  { key: "Math", name: "Mathemitic", type: "minor" },
  { key: "Phy", name: "Physic", type: "minor" },
  { key: "Chem", name: "Chemistry", type: "minor" },
];
const checkDept = function (req, res, next) {
  console.log(deptList.includes(req.params.dept));
  if (deptList.includes(req.params.dept)) {
    const deptData = deptArr.filter((d) => d["key"] === req.params.dept);
    req.session.dept = deptData[0];
    res.locals.dept = deptData[0];
    next();
  } else {
    res.redirect("/admin/departments");
  }
};

router.get("/", function (req, res, next) {
  res.render("admin/department/index");
});

router.get("/:dept", checkDept, function (req, res) {
  const deptData = deptArr.filter((d) => d["key"] === req.params.dept);
  console.log(deptData);
  res.render("admin/department/detail");
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
  const data = await Class.findByIdAndUpdate(req.body.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/class");
});

router.get("/:dept/class/delete/:id", checkDept, async function (req, res) {
  const data = await Class.findByIdAndUpdate(req.params.id, { status: false });
  res.redirect("/admin/departments/" + req.params.dept + "/class");
});

router.get("/:dept/teacher", checkDept, async function (req, res) {
  const teachers = await Teacher.find({ status: true });
  res.render("admin/department/teacher", { teachers: teachers });
});

router.get("/:dept/teacher/add", checkDept, async function (req, res) {
  const teachers = await Teacher.find({ status: true, isFamily: true });
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
  res.redirect(
    "/admin/departments/" + req.params.dept + "/teacher/detail/" + req.body.id
  );
});

router.get("/:dept/teacher/delete/:id", checkDept, async function (req, res) {
  const update = { status: false };
  const data = await Teacher.findByIdAndUpdate(req.params.id, update);
  res.redirect("/admin/departments/" + req.params.dept + "/teacher");
});

router.get("/:dept/student", checkDept, function (req, res) {
  res.render("admin/department/student");
});

router.get("/:dept/student/add", checkDept, function (req, res) {
  res.render("admin/department/student/add");
});

router.get("/:dept/subject", checkDept, function (req, res) {
  res.render("admin/department/subject");
});

router.get("/:dept/timetable", checkDept, function (req, res) {
  res.render("admin/department/timetable");
});

router.get("/:dept/timetable/add", checkDept, function (req, res) {
  res.render("admin/department/timetable/add");
});

module.exports = router;
