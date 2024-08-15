var express = require("express");
var router = express.Router();
var departmentRouter = require("./department");

/* GET users listing. */

const checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/alogin");
  }
};
router.get("/", checkAdmin, function (req, res, next) {
  res.render("admin/index");
});

router.use("/departments", checkAdmin, departmentRouter);

module.exports = router;
