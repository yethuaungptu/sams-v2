const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  fromYear: {
    type: Number,
    required: true,
  },
  toYear: {
    type: Number,
    required: true,
  },
  combination: [
    {
      department: {
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

module.exports = mongoose.model("Academics", AcademicSchema);
