const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/student/signup', auth.signupStudent);
router.post('/student/login', auth.loginStudent);

router.post('/faculty/signup', auth.signupFaculty);
router.post('/faculty/login', auth.loginFaculty);

module.exports = router;
