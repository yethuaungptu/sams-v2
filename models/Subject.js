const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
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
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "Teachers",
  },
});

module.exports = mongoose.model("Subjects", SubjectSchema);
