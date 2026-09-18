import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Clock, ListChecks } from 'lucide-react';
import api from '../api/axios';

const STREAMS = ['ALL', 'CSE', 'IT', 'ECE', 'AI', 'EE'];
const LETTERS = ['A', 'B', 'C', 'D'];
const STEPS = ['Details', 'Questions', 'Review & publish'];

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  marks: 1,
  negativeMarks: 0,
});

const fmt = (v) => (v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const styles = `
  .qz-create {
    --paper: #F7F5F0;
    --paper-raised: #FFFFFF;
    --ink: #1A2230;
    --steel: #52606D;
    --mark: #7A2A2A;
    --mark-deep: #5E1F1F;
    --gold: #A6772E;
    --gold-soft: #F1E6D2;
    --correct: #295640;
    --correct-soft: #E5EDE8;
    --line: #DDD7C8;
    --line-soft: #E9E4D6;
    --shadow-sm: 0 1px 2px rgba(26, 34, 48, 0.06);
    --shadow-md: 0 10px 28px -10px rgba(26, 34, 48, 0.2);
    --shadow-lg: 0 20px 48px -14px rgba(26, 34, 48, 0.26);

    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at 90% 0%, rgba(166, 119, 46, 0.06), transparent 40%),
      var(--paper);
    max-width: 1080px;
    margin: 0 auto;
    padding: 3.5rem 1.5rem 6rem;
  }
  .qz-create * { box-sizing: border-box; }

  .qz-create-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .qz-create-sub { color: var(--steel); margin-top: 0.4rem; }

  /* Step indicator */
  .qz-steps {
    display: flex;
    align-items: center;
    margin: 2.5rem 0 2.75rem;
  }
  .qz-step {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: none;
    border: none;
    font-family: inherit;
    font-weight: 600;
    font-size: 0.92rem;
    color: var(--steel);
    cursor: pointer;
    padding: 0.4rem 0;
  }
  .qz-step-connector {
    flex: 1;
    height: 1px;
    background: var(--line);
    margin: 0 1rem;
    min-width: 24px;
  }
  .qz-step-dot {
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-family: 'Fraunces', Georgia, serif;
    color: var(--steel);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .qz-step-active .qz-step-dot {
    border-color: var(--ink);
    background: var(--ink);
    color: #fff;
    box-shadow: var(--shadow-sm);
  }
  .qz-step-active { color: var(--ink); }
  .qz-step-done .qz-step-dot {
    border-color: var(--correct);
    background: var(--correct-soft);
    color: var(--correct);
  }
  .qz-step-done { color: var(--ink); }

  /* Layout */
  .qz-body {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 2rem;
    align-items: start;
  }

  .qz-panel {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 1.85rem;
    box-shadow: var(--shadow-sm);
  }
  .qz-panel + .qz-panel { margin-top: 1.1rem; }

  .qz-panel h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.12rem;
    margin: 0 0 1.3rem;
  }

  .qz-field { margin-top: 1.15rem; }
  .qz-field:first-child { margin-top: 0; }
  .qz-field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--steel);
    margin-bottom: 0.4rem;
    letter-spacing: 0.01em;
  }
  .qz-field input,
  .qz-field select,
  .qz-field textarea {
    width: 100%;
    font-family: inherit;
    font-size: 0.95rem;
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    resize: vertical;
  }
  .qz-field input:focus,
  .qz-field select:focus,
  .qz-field textarea:focus {
    border-color: var(--mark-deep);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(122, 42, 42, 0.1);
  }

  .qz-field-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.15rem;
    margin-top: 1.15rem;
  }
  .qz-field-row .qz-field { margin-top: 0; }

  .qz-select-wrap { position: relative; }
  .qz-select-wrap select { appearance: none; -webkit-appearance: none; padding-right: 2.2rem; cursor: pointer; }
  .qz-select-wrap::after {
    content: '';
    position: absolute;
    right: 0.9rem;
    top: 50%;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 1px solid var(--steel);
    border-bottom: 1px solid var(--steel);
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }

  /* Question tabs */
  .qz-qtabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin-bottom: 1.1rem;
  }
  .qz-qtab {
    width: 2.3rem;
    height: 2.3rem;
    border-radius: 7px;
    border: 1px solid var(--line);
    background: var(--paper-raised);
    color: var(--steel);
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.12s ease;
  }
  .qz-qtab:hover { border-color: var(--steel); box-shadow: var(--shadow-sm); }
  .qz-qtab-active { border-color: var(--ink); background: var(--ink); color: #fff; }
  .qz-qtab-done:not(.qz-qtab-active) { border-color: var(--correct); color: var(--correct); background: var(--correct-soft); }
  .qz-qtab-add { border-style: dashed; }

  .qz-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.3rem;
  }
  .qz-panel-head h3 { margin: 0; }

  .qz-icon-btn {
    background: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--mark);
    padding: 0.45rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }
  .qz-icon-btn:hover { border-color: var(--mark); box-shadow: var(--shadow-sm); }

  /* Editable option / answer key row */
  .qz-options { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem; }

  .qz-option-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.2rem 0.95rem 0.2rem 0.2rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    cursor: pointer;
    transition: border-color 0.12s ease, background 0.12s ease;
  }
  .qz-option-row.correct {
    border-color: var(--correct);
    background: var(--correct-soft);
  }

  .qz-option-letter-btn {
    width: 2.05rem;
    height: 2.05rem;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid var(--steel);
    color: var(--steel);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s ease;
  }
  .qz-option-row.correct .qz-option-letter-btn {
    border-color: var(--correct);
    background: var(--correct);
    color: #fff;
  }

  .qz-option-row input {
    border: none;
    background: transparent;
    padding: 0.6rem 0;
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--ink);
    outline: none;
    flex: 1;
    min-width: 0;
  }

  .qz-options-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--steel);
    margin-bottom: 0.5rem;
    letter-spacing: 0.01em;
  }

  .qz-add-question {
    width: 100%;
    margin-top: 1.1rem;
    font-family: inherit;
    font-weight: 600;
    font-size: 0.92rem;
    padding: 0.75rem;
    background: transparent;
    border: 1px dashed var(--line);
    color: var(--steel);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    transition: border-color 0.12s ease, color 0.12s ease;
  }
  .qz-add-question:hover { border-color: var(--ink); color: var(--ink); }

  /* Review step */
  .qz-review-meta { color: var(--steel); font-size: 0.9rem; margin: 0.3rem 0 0; }
  .qz-review-schedule {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--steel);
    margin-top: 0.65rem;
  }

  .qz-marks-tag {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--gold);
    border: 1px solid var(--gold-soft);
    background: var(--gold-soft);
    border-radius: 999px;
    padding: 0.25rem 0.65rem;
    white-space: nowrap;
  }

  .qz-review-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    font-size: 0.92rem;
  }
  .qz-review-option.correct {
    border-color: var(--correct);
    background: var(--correct-soft);
  }
  .qz-review-option .qz-option-letter-btn { cursor: default; }

  .qz-error {
    color: var(--mark);
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  /* Actions */
  .qz-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1.85rem;
  }

  .qz-btn {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.92rem;
    padding: 0.7rem 1.35rem;
    border-radius: 7px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .qz-btn:active:not(:disabled) { transform: translateY(1px); }
  .qz-btn:disabled { opacity: 0.45; cursor: default; }

  .qz-btn-outline { background: #fff; color: var(--ink); border: 1px solid var(--line); }
  .qz-btn-outline:hover:not(:disabled) { border-color: var(--ink); box-shadow: var(--shadow-sm); }

  .qz-btn-primary { background: var(--ink); color: #fff; border: 1px solid var(--ink); box-shadow: var(--shadow-sm); }
  .qz-btn-primary:hover:not(:disabled) { background: #0D1522; box-shadow: var(--shadow-md); }

  .qz-btn-publish { background: var(--mark); color: #fff; border: 1px solid var(--mark); box-shadow: var(--shadow-sm); }
  .qz-btn-publish:hover:not(:disabled) { background: var(--mark-deep); border-color: var(--mark-deep); box-shadow: var(--shadow-md); }

  /* Summary sidebar */
  .qz-summary {
    position: sticky;
    top: 1.5rem;
  }
  .qz-summary h3 { font-size: 0.95rem; }
  .qz-summary-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-size: 0.9rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--line-soft);
  }
  .qz-summary-row:last-of-type { border-bottom: none; }
  .qz-summary-row svg { color: var(--gold); flex-shrink: 0; }
  .qz-summary-note {
    font-size: 0.8rem;
    color: var(--steel);
    margin: 0.8rem 0 0;
  }

  @media (max-width: 860px) {
    .qz-body { grid-template-columns: 1fr; }
    .qz-summary { position: static; }
  }
`;

const CreateQuiz = () => {
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState({
    title: '',
    subject: '',
    stream: 'ALL',
    startTime: '',
    endTime: '',
    duration: 30,
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0),
    [questions]
  );

  const onMetaChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

  const updateQuestion = (idx, patch) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        const options = [...q.options];
        options[optIdx] = value;
        return { ...q, options };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((qs) => [...qs, emptyQuestion()]);
    setActiveQuestion(questions.length);
  };

  const removeQuestion = (idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
    setActiveQuestion((a) => Math.max(0, a >= idx ? a - 1 : a));
  };

  const isQuestionComplete = (q) => q.questionText.trim() && q.options.every((o) => o.trim());

  const validateDetails = () => {
    if (!meta.title.trim() || !meta.subject.trim() || !meta.startTime || !meta.endTime) {
      return 'Fill in every field before continuing';
    }
    if (new Date(meta.endTime) <= new Date(meta.startTime)) {
      return 'End time must be after start time';
    }
    if (Number(meta.duration) <= 0) {
      return 'Duration must be at least 1 minute';
    }
    return '';
  };

  const validateQuestions = () => {
    for (const [i, q] of questions.entries()) {
      if (!isQuestionComplete(q)) return `Question ${i + 1} is missing text or an option`;
    }
    return '';
  };

  const goToStep = (target) => {
    if (target > step) {
      const msg = step === 0 ? validateDetails() : validateQuestions();
      if (msg) {
        setError(msg);
        return;
      }
    }
    setError('');
    setStep(target);
  };

  const onPublish = async () => {
    const detailsError = validateDetails();
    const questionsError = validateQuestions();
    if (detailsError || questionsError) {
      setError(detailsError || questionsError);
      setStep(detailsError ? 0 : 1);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        ...meta,
        duration: Number(meta.duration),
        questions: questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
          negativeMarks: Number(q.negativeMarks),
          correctOption: Number(q.correctOption),
        })),
      };
      const { data } = await api.post('/quizzes', payload);
      navigate('/teacher/dashboard', { state: { createdQuizId: data._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qz-create">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <h1 className="qz-create-title">Create a quiz</h1>
      <p className="qz-create-sub">Set the schedule, add your questions, then publish.</p>

      <div className="qz-steps">
        {STEPS.map((label, idx) => (
          <Fragment key={label}>
            {idx > 0 && <div className="qz-step-connector" />}
            <button
              type="button"
              className={`qz-step ${idx === step ? 'qz-step-active' : ''} ${idx < step ? 'qz-step-done' : ''}`}
              onClick={() => goToStep(idx)}
            >
              <span className="qz-step-dot">{idx < step ? <CheckCircle2 size={14} /> : idx + 1}</span>
              {label}
            </button>
          </Fragment>
        ))}
      </div>

      <div className="qz-body">
        <div>
          {step === 0 && (
            <div className="qz-panel">
              <h3>Quiz details</h3>
              <div className="qz-field">
                <label>Quiz title</label>
                <input name="title" value={meta.title} onChange={onMetaChange} placeholder="e.g. Unit 3 — Data Structures" required />
              </div>
              <div className="qz-field-row">
                <div className="qz-field">
                  <label>Subject</label>
                  <input name="subject" value={meta.subject} onChange={onMetaChange} required />
                </div>
                <div className="qz-field">
                  <label>Stream</label>
                  <div className="qz-select-wrap">
                    <select name="stream" value={meta.stream} onChange={onMetaChange}>
                      {STREAMS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All streams' : s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="qz-field-row">
                <div className="qz-field">
                  <label>Start time</label>
                  <input type="datetime-local" name="startTime" value={meta.startTime} onChange={onMetaChange} required />
                </div>
                <div className="qz-field">
                  <label>End time</label>
                  <input type="datetime-local" name="endTime" value={meta.endTime} onChange={onMetaChange} required />
                </div>
                <div className="qz-field">
                  <label>Duration (minutes)</label>
                  <input type="number" min={1} name="duration" value={meta.duration} onChange={onMetaChange} required />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="qz-qtabs">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`qz-qtab ${idx === activeQuestion ? 'qz-qtab-active' : ''} ${isQuestionComplete(q) ? 'qz-qtab-done' : ''}`}
                    onClick={() => setActiveQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button type="button" className="qz-qtab qz-qtab-add" onClick={addQuestion} title="Add question">
                  <Plus size={15} />
                </button>
              </div>

              {questions[activeQuestion] && (
                <div className="qz-panel">
                  <div className="qz-panel-head">
                    <h3>Question {activeQuestion + 1}</h3>
                    {questions.length > 1 && (
                      <button type="button" className="qz-icon-btn" onClick={() => removeQuestion(activeQuestion)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="qz-field">
                    <label>Question text</label>
                    <textarea
                      rows={2}
                      value={questions[activeQuestion].questionText}
                      onChange={(e) => updateQuestion(activeQuestion, { questionText: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '1.15rem' }}>
                    <label className="qz-options-label">Options — click a letter to mark the correct answer</label>
                    <div className="qz-options">
                      {questions[activeQuestion].options.map((opt, optIdx) => {
                        const isCorrect = Number(questions[activeQuestion].correctOption) === optIdx;
                        return (
                          <div key={optIdx} className={`qz-option-row ${isCorrect ? 'correct' : ''}`}>
                            <button
                              type="button"
                              className="qz-option-letter-btn"
                              onClick={() => updateQuestion(activeQuestion, { correctOption: optIdx })}
                            >
                              {LETTERS[optIdx]}
                            </button>
                            <input
                              value={opt}
                              onChange={(e) => updateOption(activeQuestion, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              required
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="qz-field-row">
                    <div className="qz-field">
                      <label>Marks for correct answer</label>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={questions[activeQuestion].marks}
                        onChange={(e) => updateQuestion(activeQuestion, { marks: e.target.value })}
                      />
                    </div>
                    <div className="qz-field">
                      <label>Negative marks for wrong answer</label>
                      <input
                        type="number"
                        min={0}
                        step="0.25"
                        value={questions[activeQuestion].negativeMarks}
                        onChange={(e) => updateQuestion(activeQuestion, { negativeMarks: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button type="button" className="qz-add-question" onClick={addQuestion}>
                <Plus size={16} />
                Add another question
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="qz-panel">
                <h3>{meta.title || 'Untitled quiz'}</h3>
                <p className="qz-review-meta">
                  {meta.subject} · {meta.stream === 'ALL' ? 'All streams' : meta.stream}
                </p>
                <p className="qz-review-schedule">
                  <Clock size={14} />
                  {fmt(meta.startTime)} → {fmt(meta.endTime)} · {meta.duration} min
                </p>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="qz-panel">
                  <div className="qz-panel-head" style={{ alignItems: 'flex-start' }}>
                    <h3 style={{ maxWidth: '85%' }}>{idx + 1}. {q.questionText}</h3>
                    <span className="qz-marks-tag">+{q.marks}{q.negativeMarks > 0 ? ` / -${q.negativeMarks}` : ''}</span>
                  </div>
                  <div className="qz-options">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`qz-review-option ${Number(q.correctOption) === optIdx ? 'correct' : ''}`}>
                        <span className="qz-option-letter-btn">{LETTERS[optIdx]}</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="qz-error">{error}</p>}

          <div className="qz-actions">
            <button type="button" className="qz-btn qz-btn-outline" onClick={() => goToStep(step - 1)} disabled={step === 0}>
              <ChevronLeft size={16} />
              Back
            </button>
            {step < 2 ? (
              <button type="button" className="qz-btn qz-btn-primary" onClick={() => goToStep(step + 1)}>
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="qz-btn qz-btn-publish" onClick={onPublish} disabled={loading}>
                <Sparkles size={16} />
                {loading ? 'Publishing…' : 'Publish quiz'}
              </button>
            )}
          </div>
        </div>

        <aside className="qz-summary">
          <div className="qz-panel">
            <h3>Summary</h3>
            <div className="qz-summary-row">
              <ListChecks size={15} />
              <span>{questions.length} question{questions.length === 1 ? '' : 's'}</span>
            </div>
            <div className="qz-summary-row">
              <Sparkles size={15} />
              <span>{totalMarks} total marks</span>
            </div>
            <div className="qz-summary-row">
              <Clock size={15} />
              <span>{meta.duration || 0} min duration</span>
            </div>
            <p className="qz-summary-note">
              {questions.filter(isQuestionComplete).length} of {questions.length} questions complete
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateQuiz;