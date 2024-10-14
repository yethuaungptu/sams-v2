const mongoose = require("mongoose");
var moment = require("moment-timezone");
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  classId: {
    type: Schema.Types.ObjectId,
    ref: "Classes",
  },
  timetableId: {
    type: Schema.Types.ObjectId,
    ref: "Timetables",
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "Subjects",
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "Teachers",
  },
  time: {
    type: Number,
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    default: new Date().getMonth(),
  },
  list: [
    {
      isAttendance: {
        type: Boolean,
        required: true,
      },
      studentId: {
        type: Schema.Types.ObjectId,
        ref: "Students",
      },
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  department: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Attendances", AttendanceSchema);
