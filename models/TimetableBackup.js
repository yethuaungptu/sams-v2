const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TimetableBackupSchema = new Schema({
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
      teacher: {
        type: String,
        required: true,
      },
      subject: {
        type: String,
        required: true,
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
  class: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TimetableBackups", TimetableBackupSchema);
