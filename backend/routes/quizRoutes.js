const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createQuiz, getMyQuizzes, getQuizForTeacher, getAvailableQuizzes } = require('../controllers/quizController');

router.post('/', protect, authorize('teacher'), createQuiz);
router.get('/mine', protect, authorize('teacher'), getMyQuizzes);
router.get('/available', protect, authorize('student'), getAvailableQuizzes);
router.get('/:id/manage', protect, authorize('teacher'), getQuizForTeacher);

module.exports = router;
