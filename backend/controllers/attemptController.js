const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const Student = require('../models/Student');

const GRACE_MS = 5000; // small network-latency buffer

// Grades an in-progress attempt against a quiz's answer key
const gradeAnswers = (quiz, answers) => {
  const answerMap = {};
  (answers || []).forEach((a) => {
    if (a && typeof a.questionIndex === 'number') {
      answerMap[a.questionIndex] = a.selectedOption;
    }
  });

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let totalMarks = 0;
  const review = [];

  quiz.questions.forEach((q, idx) => {
    totalMarks += q.marks;
    const selected = answerMap.hasOwnProperty(idx) ? answerMap[idx] : null;

    if (selected === null || selected === undefined) {
      unansweredCount += 1;
      review.push({ questionIndex: idx, selectedOption: null, correctOption: q.correctOption, isCorrect: false, marksAwarded: 0 });
      return;
    }

    if (selected === q.correctOption) {
      correctCount += 1;
      score += q.marks;
      review.push({ questionIndex: idx, selectedOption: selected, correctOption: q.correctOption, isCorrect: true, marksAwarded: q.marks });
    } else {
      wrongCount += 1;
      score -= q.negativeMarks;
      review.push({ questionIndex: idx, selectedOption: selected, correctOption: q.correctOption, isCorrect: false, marksAwarded: -q.negativeMarks });
    }
  });

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0;

  return { score, correctCount, wrongCount, unansweredCount, totalMarks, percentage, review };
};

// POST /api/attempts/start  { quizId }  (student)
const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.published) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.stream !== 'ALL' && quiz.stream !== req.user.stream) {
      return res.status(403).json({ message: 'This quiz is not available for your stream' });
    }

    const now = new Date();
    if (now < quiz.startTime) {
      return res.status(403).json({ message: 'This quiz has not started yet' });
    }
    if (now > quiz.endTime) {
      return res.status(403).json({ message: 'This quiz has closed' });
    }

    let attempt = await Attempt.findOne({ quiz: quiz._id, student: req.user._id });

    if (attempt && attempt.status === 'submitted') {
      return res.status(409).json({ message: 'You have already attempted this quiz' });
    }

    if (!attempt) {
      try {
        attempt = await Attempt.create({ quiz: quiz._id, student: req.user._id, startedAt: now, status: 'in-progress' });
      } catch (err) {
        // Race condition: unique index caught a duplicate start
        if (err.code === 11000) {
          return res.status(409).json({ message: 'You have already started or attempted this quiz' });
        }
        throw err;
      }
    }

    const deadline = new Date(Math.min(quiz.endTime.getTime(), attempt.startedAt.getTime() + quiz.duration * 60000));

    res.json({
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      deadline,
      serverNow: now,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        stream: quiz.stream,
        duration: quiz.duration,
        questions: quiz.questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/attempts/:id/submit  { answers: [{ questionIndex, selectedOption }] }  (student)
const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This attempt does not belong to you' });
    }
    if (attempt.status === 'submitted') {
      return res.status(409).json({ message: 'This attempt has already been submitted' });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const now = new Date();
    const deadline = new Date(Math.min(quiz.endTime.getTime(), attempt.startedAt.getTime() + quiz.duration * 60000));
    const submittedAt = now.getTime() > deadline.getTime() + GRACE_MS ? deadline : now;

    const { answers } = req.body;
    const graded = gradeAnswers(quiz, answers);

    attempt.answers = (answers || []).map((a) => ({ questionIndex: a.questionIndex, selectedOption: a.selectedOption }));
    attempt.status = 'submitted';
    attempt.submittedAt = submittedAt;
    attempt.timeTakenSeconds = Math.max(0, Math.round((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000));
    attempt.score = graded.score;
    attempt.correctCount = graded.correctCount;
    attempt.wrongCount = graded.wrongCount;
    attempt.unansweredCount = graded.unansweredCount;
    attempt.totalMarks = graded.totalMarks;
    attempt.percentage = graded.percentage;
    await attempt.save();

    res.json({
      attemptId: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      unansweredCount: attempt.unansweredCount,
      timeTakenSeconds: attempt.timeTakenSeconds,
      autoSubmitted: submittedAt.getTime() === deadline.getTime() && now.getTime() > deadline.getTime(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attempts/:quizId/mine  (student) - full review with correct answers, only after submission
const getMyResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({ quiz: req.params.quizId, student: req.user._id });
    if (!attempt) return res.status(404).json({ message: 'No attempt found for this quiz' });
    if (attempt.status !== 'submitted') return res.status(403).json({ message: 'Quiz not yet submitted' });

    const quiz = await Quiz.findById(req.params.quizId);
    const graded = gradeAnswers(quiz, attempt.answers);

    const questionsReview = quiz.questions.map((q, idx) => ({
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      ...graded.review[idx],
    }));

    res.json({
      quizTitle: quiz.title,
      subject: quiz.subject,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      unansweredCount: attempt.unansweredCount,
      timeTakenSeconds: attempt.timeTakenSeconds,
      submittedAt: attempt.submittedAt,
      questions: questionsReview,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attempts/:quizId/all  (teacher) - results table for a quiz
const getQuizAttempts = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quizId, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attempts = await Attempt.find({ quiz: quiz._id, status: 'submitted' }).populate('student', 'name rollNumber stream');

    // Rank by score descending (1 = best), independent of table display order
    const byScoreDesc = [...attempts].sort((a, b) => b.score - a.score);
    const rankMap = {};
    byScoreDesc.forEach((a, idx) => {
      rankMap[a._id.toString()] = idx + 1;
    });

    const classAverage =
      attempts.length > 0 ? Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) * 100) / 100 : 0;

    // Display sorted by percentage ascending (increasing order), as specified
    const rows = attempts
      .sort((a, b) => a.percentage - b.percentage)
      .map((a) => ({
        attemptId: a._id,
        studentName: a.student.name,
        rollNumber: a.student.rollNumber,
        stream: a.student.stream,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        correctCount: a.correctCount,
        wrongCount: a.wrongCount,
        unansweredCount: a.unansweredCount,
        timeTakenSeconds: a.timeTakenSeconds,
        rank: rankMap[a._id.toString()],
      }));

    res.json({ quizTitle: quiz.title, classAverage, totalAttempts: attempts.length, results: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { startAttempt, submitAttempt, getMyResult, getQuizAttempts };
