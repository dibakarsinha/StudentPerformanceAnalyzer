const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const bcrypt = require("bcryptjs");

/* ---------- REGISTER STUDENT ---------- */
exports.registerStudent = async (req, res) => {
  const { name, email, regNo, password } = req.body;

  const existing = await Student.findOne({ email });
  if (existing) return res.json({ msg: "Student already exists" });

  const hash = await bcrypt.hash(password, 10);

  const student = new Student({
    name,
    email,
    regNo,
    password: hash
  });

  await student.save();

  return res.json({ msg: "Registered successfully" });
};

/* ---------- STUDENT LOGIN ---------- */
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student) return res.json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, student.password);
  if (!match) return res.json({ msg: "Invalid credentials" });

  return res.json({ msg: "Login successful" });
};

/* ---------- FACULTY LOGIN ---------- */
exports.loginFaculty = async (req, res) => {
  const { email, password } = req.body;

  const faculty = await Faculty.findOne({ email });

  console.log("Searching for:", email);
  console.log("Faculty found:", faculty);

  if (!faculty) {
    return res.json({ msg: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, faculty.password);

  console.log("Password match:", match);

  if (!match) {
    return res.json({ msg: "Invalid credentials" });
  }

  return res.json({ msg: "Login successful" });
};
