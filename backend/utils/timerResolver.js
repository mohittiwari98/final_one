// The core of the multi-level timer: given a quiz and an in-progress attempt,
// work out the deadline for whatever question the student is currently on.
//
// Precedence, exactly as in the project synopsis:
//   1. question.duration  (seconds)   -> timer scoped to just this question
//   2. phase.duration     (minutes)   -> timer shared by every question in the phase
//   3. quiz.duration      (minutes)   -> the old single whole-quiz timer, used as fallback
//   4. none set anywhere              -> untimed, only the quiz's hard endTime applies
//
// The quiz's endTime is always an outer hard stop, independent of all of the above.

function resolveCurrentDeadline(quiz, attempt) {
  const question = quiz.questions[attempt.currentQuestionIndex];

  const phase =
    question.phaseIndex !== undefined && question.phaseIndex !== null && quiz.phases[question.phaseIndex]
      ? quiz.phases[question.phaseIndex]
      : null;

  let deadline = null;
  let source = 'NONE';

  if (question.duration) {
    deadline = new Date(attempt.itemStartedAt.getTime() + question.duration * 1000);
    source = 'QUESTION';
  } else if (phase && phase.duration) {
    deadline = new Date(attempt.phaseStartedAt.getTime() + phase.duration * 60000);
    source = 'PHASE';
  } else if (quiz.duration) {
    deadline = new Date(attempt.startedAt.getTime() + quiz.duration * 60000);
    source = 'QUIZ';
  }

  // The overall quiz end time always wins if it would cut things off sooner.
  if (deadline && quiz.endTime && quiz.endTime.getTime() < deadline.getTime()) {
    deadline = quiz.endTime;
  }

  return { deadline, source };
}

module.exports = { resolveCurrentDeadline };
