import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Countdown from '../components/Countdown';

const letters = ['A', 'B', 'C', 'D'];

const sourceLabel = {
  QUESTION: 'Question timer',
  PHASE: 'Phase timer',
  QUIZ: 'Quiz timer',
  NONE: 'Untimed',
};

const styles = `
  .qz-take {
    --paper: #F7F5F0;
    --paper-raised: #FFFFFF;
    --ink: #1C2430;
    --steel: #52606D;
    --mark: #8B2E2E;
    --line: #DAD6CB;

    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    color: var(--ink);
    background: var(--paper);
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem 6rem;
  }
  .qz-take * { box-sizing: border-box; }

  .qz-take-header {
    position: sticky;
    top: 0;
    background: var(--paper);
    padding: 2.25rem 0 1rem;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .qz-take-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(1.5rem, 3vw, 1.9rem);
    margin: 0;
  }

  .qz-take-progress-label {
    color: var(--steel);
    font-size: 0.88rem;
    margin-top: 0.35rem;
  }

  .qz-take-progress-bar {
    height: 3px;
    background: var(--line);
    border-radius: 2px;
    margin-top: 0.7rem;
    overflow: hidden;
  }
  .qz-take-progress-fill {
    height: 100%;
    background: var(--mark);
    transition: width 0.2s ease;
  }

  .qz-countdown-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    flex-shrink: 0;
  }
  .qz-countdown-source {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--steel);
  }
  .qz-countdown-none {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
    color: var(--steel);
  }

  .qz-error {
    color: var(--mark);
    font-size: 0.9rem;
    margin: 0 0 1rem;
  }

  .qz-question-card {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 1.5rem;
  }

  .qz-question-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .qz-question-text {
    font-size: 1.05rem;
    line-height: 1.5;
    margin: 0;
    max-width: 82%;
  }
  .qz-marks-tag {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: var(--steel);
    border: 1px solid var(--line);
    border-radius: 2px;
    padding: 0.2rem 0.5rem;
    white-space: nowrap;
  }

  .qz-options { margin-top: 1.1rem; display: flex; flex-direction: column; gap: 0.6rem; }

  .qz-option-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    font-size: 0.94rem;
    font-family: inherit;
    background: var(--paper-raised);
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: border-color 0.12s ease, background 0.12s ease;
  }
  .qz-option-btn:hover { border-color: var(--steel); }

  .qz-option-btn.selected {
    border-color: var(--ink);
    background: rgba(28,36,48,0.04);
  }

  .qz-option-letter {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid var(--steel);
    color: var(--steel);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-family: 'Fraunces', Georgia, serif;
    transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
  }
  .qz-option-btn.selected .qz-option-letter {
    border-color: var(--ink);
    background: var(--ink);
    color: #fff;
  }

  .qz-take-divider {
    border: none;
    border-top: 1px solid var(--line);
    margin: 2.25rem 0 1.5rem;
  }

  .qz-nav-row { display: flex; justify-content: flex-end; gap: 0.75rem; }

  .qz-submit {
    font-family: inherit;
    font-size: 1rem;
    padding: 0.85rem 1.75rem;
    background: var(--mark);
    color: #fff;
    border: 1px solid var(--mark);
    border-radius: 3px;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .qz-submit:disabled { opacity: 0.6; cursor: default; }
  .qz-submit:not(:disabled):hover { opacity: 0.92; }

  .qz-submit-note {
    font-size: 0.85rem;
    color: var(--steel);
    margin-top: 0.75rem;
  }

  .qz-start-error {
    max-width: 800px;
    margin: 3rem auto 0;
    padding: 2rem 1.5rem;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 4px;
  }
  .qz-start-error h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; margin: 0 0 0.5rem; }
  .qz-start-error p { color: var(--steel); margin: 0; }
`;

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // session: { attemptId, quiz, currentQuestionIndex, deadline, source }
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({}); // absolute questionIndex -> selectedOption
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // true while advancing or submitting
  const finishingRef = useRef(false);

  useEffect(() => {
    api
      .post('/attempts/start', { quizId })
      .then(({ data }) => setSession(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not start this quiz'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const select = (optIdx) => {
    setAnswers((a) => ({ ...a, [session.currentQuestionIndex]: optIdx }));
  };

  const submit = useCallback(async () => {
    if (finishingRef.current || !session) return;
    finishingRef.current = true;
    setBusy(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
          questionIndex: Number(questionIndex),
          selectedOption,
        })),
      };
      await api.post(`/attempts/${session.attemptId}/submit`, payload);
      navigate(`/student/quizzes/${quizId}/result`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your attempt');
      finishingRef.current = false;
      setBusy(false);
    }
  }, [answers, session, quizId, navigate]);

  // Called both when the timer for the current question/phase runs out,
  // and when the student manually taps "Next".
  const advance = useCallback(async () => {
    if (finishingRef.current || !session || busy) return;
    setBusy(true);
    try {
      const selectedOption = answers[session.currentQuestionIndex];
      const { data } = await api.post(`/attempts/${session.attemptId}/advance`, {
        selectedOption: typeof selectedOption === 'number' ? selectedOption : undefined,
      });
      if (data.finished) {
        await submit();
        return;
      }
      setSession((s) => ({
        ...s,
        currentQuestionIndex: data.currentQuestionIndex,
        deadline: data.deadline,
        source: data.source,
      }));
      setBusy(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not move to the next question');
      setBusy(false);
    }
  }, [session, answers, busy, submit]);

  if (loading)
    return (
      <div className="qz-take">
        <style>{styles}</style>
        <p style={{ color: 'var(--steel)', paddingTop: '2.25rem' }}>Setting up your quiz…</p>
      </div>
    );

  if (error && !session) {
    return (
      <div className="qz-take">
        <style>{styles}</style>
        <div className="qz-start-error">
          <h3>Can't start this quiz</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { quiz, currentQuestionIndex, deadline, source } = session;
  const q = quiz.questions[currentQuestionIndex];
  const isLast = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="qz-take">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-take-header">
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 className="qz-take-title">{quiz.title}</h1>
          <p className="qz-take-progress-label">
            Question {currentQuestionIndex + 1} of {quiz.questions.length} · {answeredCount} answered
          </p>
          <div className="qz-take-progress-bar">
            <div className="qz-take-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="qz-countdown-wrap">
          <span className="qz-countdown-source">{sourceLabel[source]}</span>
          {deadline ? (
            <Countdown target={deadline} onExpire={advance} size="sm" />
          ) : (
            <span className="qz-countdown-none">No time limit</span>
          )}
        </div>
      </div>

      {error && <p className="qz-error">{error}</p>}

      <div className="qz-question-card">
        <div className="qz-question-top">
          <p className="qz-question-text">{currentQuestionIndex + 1}. {q.questionText}</p>
          <span className="qz-marks-tag">
            +{q.marks}{q.negativeMarks > 0 ? ` / -${q.negativeMarks}` : ''}
          </span>
        </div>
        <div className="qz-options">
          {q.options.map((opt, optIdx) => (
            <button
              key={optIdx}
              type="button"
              className={`qz-option-btn ${answers[currentQuestionIndex] === optIdx ? 'selected' : ''}`}
              onClick={() => select(optIdx)}
              disabled={busy}
            >
              <span className="qz-option-letter">{letters[optIdx]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="qz-take-divider" />

      <div className="qz-nav-row">
        {isLast ? (
          <button className="qz-submit" onClick={submit} disabled={busy}>
            {busy ? 'Submitting…' : 'Submit quiz'}
          </button>
        ) : (
          <button className="qz-submit" onClick={advance} disabled={busy}>
            {busy ? 'Please wait…' : 'Next question'}
          </button>
        )}
      </div>
      <p className="qz-submit-note">
        You can only attempt this quiz once. It will move on automatically when the timer runs out.
      </p>
    </div>
  );
};

export default TakeQuiz;
