const router = require("express").Router();
const {
  getStudentByRegNo,
  uploadMarks
} = require("../controllers/facultyController");

router.get("/:regNo", getStudentByRegNo);
router.post("/upload", uploadMarks);

module.exports = router;
