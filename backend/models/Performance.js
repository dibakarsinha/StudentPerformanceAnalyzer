const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  predictedCGPA: Number
});

module.exports = mongoose.model("Performance", performanceSchema);
