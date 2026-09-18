const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// POST /api/auth/teacher/register
const registerTeacher = async (req, res, next) => {
  try {
    const { name, email, subject, password } = req.body;

    if (!name || !email || !subject || !password) {
      return res.status(400).json({ message: 'Name, email, subject and password are required' });
    }

    const exists = await Teacher.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const teacher = await Teacher.create({ name, email, subject, password });

    res.status(201).json({
      token: generateToken(teacher._id, 'teacher'),
      user: { id: teacher._id, name: teacher.name, email: teacher.email, subject: teacher.subject, role: 'teacher' },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/teacher/login
const loginTeacher = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacher || !(await teacher.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(teacher._id, 'teacher'),
      user: { id: teacher._id, name: teacher.name, email: teacher.email, subject: teacher.subject, role: 'teacher' },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/student/register
const registerStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, stream, password } = req.body;

    if (!name || !rollNumber || !stream || !password) {
      return res.status(400).json({ message: 'Name, roll number, stream and password are required' });
    }

    const exists = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (exists) {
      return res.status(409).json({ message: 'This roll number is already registered' });
    }

    const student = await Student.create({ name, rollNumber, stream, password });

    res.status(201).json({
      token: generateToken(student._id, 'student'),
      user: { id: student._id, name: student.name, rollNumber: student.rollNumber, stream: student.stream, role: 'student' },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/student/login
const loginStudent = async (req, res, next) => {
  try {
    const { rollNumber, password } = req.body;
    if (!rollNumber || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    const student = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }

    res.json({
      token: generateToken(student._id, 'student'),
      user: { id: student._id, name: student.name, rollNumber: student.rollNumber, stream: student.stream, role: 'student' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerTeacher, loginTeacher, registerStudent, loginStudent };
