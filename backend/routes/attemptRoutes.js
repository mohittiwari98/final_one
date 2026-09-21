const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { startAttempt, advanceAttempt, submitAttempt, getMyResult, getQuizAttempts } = require('../controllers/attemptController');

router.post('/start', protect, authorize('student'), startAttempt);
router.post('/:id/advance', protect, authorize('student'), advanceAttempt);
router.post('/:id/submit', protect, authorize('student'), submitAttempt);
router.get('/:quizId/mine', protect, authorize('student'), getMyResult);
router.get('/:quizId/all', protect, authorize('teacher'), getQuizAttempts);

module.exports = router;
