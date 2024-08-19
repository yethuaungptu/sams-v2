const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Classes", ClassSchema);
