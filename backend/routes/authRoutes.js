const router = require("express").Router();
const {
  registerStudent,
  loginStudent,
  loginFaculty
} = require("../controllers/authController");

router.post("/register", registerStudent);
router.post("/student-login", loginStudent);
router.post("/faculty-login", loginFaculty);

module.exports = router;
