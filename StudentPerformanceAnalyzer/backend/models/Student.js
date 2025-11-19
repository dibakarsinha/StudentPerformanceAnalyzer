const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  sem: Number,
  subject: String,
  mid1: Number,
  mid2: Number,
  endsem: Number,
  predictedEnd: Number,
  predictedCgpa: Number,
  timestamp: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  course: String,
  semester: Number,
  cumulativeGPA: Number,
  records: [MarksSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
