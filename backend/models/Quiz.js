const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctOption: { type: Number, required: true, min: 0, max: 3 },
  marks: { type: Number, required: true, default: 1, min: 0 },
  negativeMarks: { type: Number, required: true, default: 0, min: 0 },
  // Optional per-question time limit, in SECONDS. Leave unset to inherit
  // from the phase or the quiz (see the timer precedence rule below).
  duration: { type: Number, min: 1, default: null },
  // Optional index into quiz.phases, so this question can inherit a
  // phase-level duration instead of falling straight back to the quiz default.
  phaseIndex: { type: Number, default: null },
});

// A phase is just a named group of questions that can share one duration.
// Phases are entirely optional — a quiz with no phases behaves exactly like before.
const phaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: Number, min: 1, default: null }, // minutes
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    stream: {
      type: String,
      required: true,
      enum: ['CSE', 'IT', 'ECE', 'AI', 'EE', 'ALL'],
      default: 'ALL',
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 }, // minutes — the quiz-level fallback
    phases: { type: [phaseSchema], default: [] },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A quiz must have at least one question',
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quizSchema.pre('validate', function (next) {
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

// Total marks possible, computed on the fly (not persisted)
quizSchema.virtual('totalMarks').get(function () {
  return this.questions.reduce((sum, q) => sum + q.marks, 0);
});

quizSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
