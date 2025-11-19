const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  subject: String,
  students: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Faculty', FacultySchema);
