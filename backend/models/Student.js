const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  regNo: { type: String, unique: true },

  exams: [
    {
      mid: Number,
      end: Number,
      semester: Number
    }
  ]
});

module.exports = mongoose.model("Student", studentSchema);
