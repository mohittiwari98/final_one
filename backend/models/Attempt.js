const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: Number, default: null }, // null = unanswered
});

const attemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    answers: { type: [answerSchema], default: [] },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Enforce one attempt per student per quiz
attemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
