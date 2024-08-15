var express = require("express");
var router = express.Router();

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

router.get("/:dept/class", checkDept, function (req, res) {
  res.render("admin/department/class");
});

router.get("/:dept/teacher", checkDept, function (req, res) {
  res.render("admin/department/teacher");
});

router.get("/:dept/student", checkDept, function (req, res) {
  res.render("admin/department/student");
});

router.get("/:dept/subject", checkDept, function (req, res) {
  res.render("admin/department/subject");
});

router.get("/:dept/timetable", checkDept, function (req, res) {
  res.render("admin/department/timetable");
});

module.exports = router;
