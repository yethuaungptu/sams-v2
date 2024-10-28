var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var studentRouter = require("./routes/student");
var teacherRouter = require("./routes/teacher");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// mongoose.connect("mongodb://127.0.0.1/samsv2db");
mongoose.connect(
  "mongodb+srv://sams:sams-2024@sams.skbqs.mongodb.net/?retryWrites=true&w=majority&appName=sams"
);
const db = mongoose.connection;
db.on("error", console.error.bind("Mongodb connection error at samsdb"));

app.use(
  session({
    secret: "F!@ht40UrWay",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/teacher", teacherRouter);
app.use("/student", studentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
