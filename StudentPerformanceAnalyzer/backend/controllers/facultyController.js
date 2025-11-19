const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const getAllStudents = async (req, res) => {
  try {
    const f = await Faculty.findOne({ username: req.user.username });
    if (!f) return res.status(404).json({ message: 'Faculty not found' });
    const students = await Student.find({ studentID: { $in: f.students } });
    res.json({ students });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getStudentById = async (req, res) => {
  const { studentID } = req.params;
  try {
    const s = await Student.findOne({ studentID });
    if (!s) return res.status(404).json({ message: 'Student not found' });
    res.json({ student: s });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllStudents, getStudentById };
