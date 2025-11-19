const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

router.use(authMiddleware);

router.get('/me', ctrl.getMyRecords);
router.post('/:studentID/marks', ctrl.addOrUpdateMarks);

module.exports = router;
