const Student = require('../models/Student');

// student adds marks (or updates)
const addOrUpdateMarks = async (req, res) => {
  const { studentID } = req.params;
  const payload = req.body; // { sem, subject, mid1, mid2, endsem }
  try {
    const s = await Student.findOne({ studentID });
    if (!s) return res.status(404).json({ message: 'Student not found' });

    let rec = s.records.find(r => r.sem === payload.sem && r.subject === payload.subject);
    if (!rec) {
      s.records.push(payload);
    } else {
      Object.assign(rec, payload);
    }

    await s.save();
    res.json({ message: 'saved', records: s.records });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyRecords = async (req, res) => {
  const { studentID } = req.user;
  try {
    const s = await Student.findOne({ studentID });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json({ profile: { name: s.name, studentID: s.studentID, course: s.course, semester: s.semester, cumulativeGPA: s.cumulativeGPA }, records: s.records });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { addOrUpdateMarks, getMyRecords };
