const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// POST /api/quizzes  (teacher)
const createQuiz = async (req, res, next) => {
  try {
    const { title, subject, stream, startTime, endTime, duration, questions } = req.body;

    if (!title || !subject || !startTime || !endTime || !duration || !questions) {
      return res.status(400).json({ message: 'Missing required quiz fields' });
    }

    const quiz = await Quiz.create({
      title,
      subject,
      stream: stream || 'ALL',
      startTime,
      endTime,
      duration,
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/mine  (teacher) - all quizzes this teacher created
const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    const withStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Attempt.countDocuments({ quiz: quiz._id, status: 'submitted' });
        return { ...quiz.toObject(), attemptCount };
      })
    );

    res.json(withStats);
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/:id/manage  (teacher) - full quiz incl. correct answers
const getQuizForTeacher = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/available  (student) - quizzes matching stream, not yet attempted
const getAvailableQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      published: true,
      $or: [{ stream: req.user.stream }, { stream: 'ALL' }],
    })
      .select('-questions.correctOption')
      .sort({ startTime: 1 });

    const attempts = await Attempt.find({ student: req.user._id }).select('quiz status');
    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.quiz.toString()] = a.status;
    });

    const now = new Date();
    const result = quizzes.map((q) => {
      const obj = q.toObject();
      const attemptStatus = attemptMap[q._id.toString()] || null;
      let phase = 'upcoming';
      if (now >= q.startTime && now <= q.endTime) phase = 'live';
      if (now > q.endTime) phase = 'closed';
      return {
        _id: obj._id,
        title: obj.title,
        subject: obj.subject,
        stream: obj.stream,
        startTime: obj.startTime,
        endTime: obj.endTime,
        duration: obj.duration,
        questionCount: obj.questions.length,
        totalMarks: obj.questions.reduce((s, q2) => s + q2.marks, 0),
        phase,
        attemptStatus, // null | 'in-progress' | 'submitted'
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createQuiz, getMyQuizzes, getQuizForTeacher, getAvailableQuizzes };
