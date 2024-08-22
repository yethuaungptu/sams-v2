const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TimetableSchema = new Schema({
  academicId: {
    type: Schema.Types.ObjectId,
    ref: "Academics",
  },
  building: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  times: [
    {
      time: {
        type: String,
        required: true,
      },
      teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teachers",
      },
      subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subjects",
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
  classId: {
    type: Schema.Types.ObjectId,
    ref: "Classes",
  },
});

module.exports = mongoose.model("Timetables", TimetableSchema);
