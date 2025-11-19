const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/Student");
require("dotenv").config();

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Clear old data
    await Student.deleteMany({});

    // Hash a default password
    const hashedPassword = await bcrypt.hash("student123", 10);

    const demoStudents = [
      {
        name: "Ishpreet Kaur",
        studentID: "S101",
        email: "ishpreet@example.com",
        passwordHash: hashedPassword,
        course: "CSE",
        semester: 5,
        cumulativeGPA: 8.2,
        records: [
          {
            sem: 5,
            subject: "DBMS",
            mid1: 18,
            mid2: 19,
            endsem: 72,
            predictedEnd: 75,
            predictedCgpa: 8.5
          }
        ]
      },
      {
        name: "Demo Student 2",
        studentID: "S102",
        email: "student2@example.com",
        passwordHash: hashedPassword,
        course: "CSE",
        semester: 5,
        cumulativeGPA: 7.5,
        records: [
          {
            sem: 5,
            subject: "OOPS",
            mid1: 15,
            mid2: 17,
            endsem: 60,
            predictedEnd: 65,
            predictedCgpa: 7.9
          }
        ]
      }
    ];

    await Student.insertMany(demoStudents);
    console.log("Demo students seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();
