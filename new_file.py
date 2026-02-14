from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017/pbl")
db = client.get_database()

students = list(db["students"].find({}, {"_id": 0}))
faculties = list(db["faculties"].find({}, {"_id": 0}))

with open("students.json", "w") as f:
    json.dump(students, f, indent=4)

with open("faculties.json", "w") as f:
    json.dump(faculties, f, indent=4)

print("✅ JSON files created")
