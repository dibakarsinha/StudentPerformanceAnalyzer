const Student = require("../models/Student");

exports.getStudentByEmail = async (req, res) => {
  try {
    const student = await Student.findOne({
      email: req.params.email
    });

    if (!student) {
      return res.json({ msg: "Student not found" });
    }

    res.json(student);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
