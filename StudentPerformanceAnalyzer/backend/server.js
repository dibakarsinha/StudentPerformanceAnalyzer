require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

connectDB(process.env.MONGO_URI);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));

app.get('/', (req, res) => res.send('StudentPerformance API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening ${PORT}`));
