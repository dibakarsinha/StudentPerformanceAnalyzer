const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const signupStudent = async (req, res) => {
  const { name, studentID, email, password, course, semester } = req.body;
  try {
    const existing = await Student.findOne({ studentID });
    if (existing) return res.status(400).json({ message: 'Student ID exists' });
    const hash = await bcrypt.hash(password, 10);
    const s = new Student({ name, studentID, email, passwordHash: hash, course, semester });
    await s.save();
    res.json({ message: 'student registered' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const loginStudent = async (req, res) => {
  const { studentID, password } = req.body;
  try {
    const s = await Student.findOne({ studentID });
    if (!s) return res.status(404).json({ message: 'Student not found' });
    const ok = await bcrypt.compare(password, s.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: s._id, role: 'student', studentID: s.studentID }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, studentID: s.studentID, name: s.name });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const signupFaculty = async (req, res) => {
  const { name, username, password, subject } = req.body;
  try {
    const existing = await Faculty.findOne({ username });
    if (existing) return res.status(400).json({ message: 'username exists' });
    const hash = await bcrypt.hash(password, 10);
    const f = new Faculty({ name, username, passwordHash: hash, subject, students: [] });
    await f.save();
    res.json({ message: 'faculty registered' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const loginFaculty = async (req, res) => {
  const { username, password } = req.body;
  try {
    const f = await Faculty.findOne({ username });
    if (!f) return res.status(404).json({ message: 'Faculty not found' });
    const ok = await bcrypt.compare(password, f.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: f._id, role: 'faculty', username: f.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username: f.username, name: f.name });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { signupStudent, loginStudent, signupFaculty, loginFaculty };
