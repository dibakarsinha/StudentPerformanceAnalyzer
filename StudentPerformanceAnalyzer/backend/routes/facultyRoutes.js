const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/facultyController');

router.use(authMiddleware);

router.get('/students', ctrl.getAllStudents);
router.get('/student/:studentID', ctrl.getStudentById);

module.exports = router;
