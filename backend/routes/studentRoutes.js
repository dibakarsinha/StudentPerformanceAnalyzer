const router = require("express").Router();
const Student = require("../models/Student");

router.get("/:email", async (req, res) => {
  const student = await Student.findOne({ email: req.params.email });
  res.json(student);
});

module.exports = router;
