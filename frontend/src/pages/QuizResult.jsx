import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import api from '../api/axios';

const letters = ['A', 'B', 'C', 'D'];

// correct / wrong / unanswered — kept consistent everywhere a result is shown
const CORRECT = '#295640';
const WRONG = '#7A2A2A';
const NEUTRAL = '#9C9686';
const PIE_COLORS = [CORRECT, WRONG, NEUTRAL];
const LINE = '#DDD7C8';
const STEEL = '#52606D';

const styles = `
  .qz-result {
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
    max-width: 900px;
    margin: 0 auto;
    padding: 3.5rem 1.5rem 6rem;
  }
  .qz-result * { box-sizing: border-box; }

  .qz-result-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .qz-result-subject {
    color: var(--gold);
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    margin-top: 0.4rem;
  }

  .qz-divider {
    border: none;
    border-top: 1px solid var(--line);
    margin: 2.5rem 0;
  }

  .qz-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  .qz-stat-box {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 1.3rem 1rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .qz-stat-box .value {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.6rem;
    font-variant-numeric: tabular-nums;
  }
  .qz-stat-box .label {
    font-size: 0.78rem;
    color: var(--steel);
    margin-top: 0.25rem;
  }

  .qz-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  .qz-chart-panel {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 1.4rem 1.4rem 0.85rem;
    height: 270px;
    box-shadow: var(--shadow-sm);
  }
  .qz-chart-panel h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.02rem;
    margin: 0 0 0.5rem;
  }

  .qz-review-heading {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.45rem;
    letter-spacing: -0.01em;
    margin: 0 0 1.3rem;
  }

  .qz-question-card {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 1.6rem 1.75rem;
    box-shadow: var(--shadow-sm);
  }
  .qz-question-card + .qz-question-card { margin-top: 1.1rem; }

  .qz-question-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .qz-question-text {
    font-size: 1.02rem;
    line-height: 1.55;
    margin: 0;
    max-width: 85%;
  }

  .qz-options { margin-top: 1.15rem; display: flex; flex-direction: column; gap: 0.65rem; }

  .qz-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    font-size: 0.94rem;
  }
  .qz-option-letter {
    width: 1.65rem;
    height: 1.65rem;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid var(--steel);
    color: var(--steel);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
  }
  .qz-option.correct {
    border-color: var(--correct);
    background: var(--correct-soft);
  }
  .qz-option.correct .qz-option-letter {
    border-color: var(--correct);
    color: var(--correct);
    background: #fff;
  }
  .qz-option.incorrect {
    border-color: var(--mark);
    background: var(--gold-soft);
  }
  .qz-option.incorrect .qz-option-letter {
    border-color: var(--mark);
    color: var(--mark);
    background: #fff;
  }

  .qz-question-foot {
    font-size: 0.85rem;
    color: var(--steel);
    margin-top: 0.95rem;
  }

  .qz-error { color: var(--mark); }

  @media (max-width: 700px) {
    .qz-stat-grid { grid-template-columns: repeat(2, 1fr); }
    .qz-charts { grid-template-columns: 1fr; }
  }
`;

const QuizResult = () => {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/attempts/${quizId}/mine`)
      .then(({ data }) => setResult(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your result'))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading)
    return (
      <div className="qz-result">
        <style>{styles}</style>
        <p style={{ color: 'var(--steel)' }}>Loading your result…</p>
      </div>
    );

  if (error)
    return (
      <div className="qz-result">
        <style>{styles}</style>
        <p className="qz-error">{error}</p>
      </div>
    );

  const pieData = [
    { name: 'Correct', value: result.correctCount },
    { name: 'Wrong', value: result.wrongCount },
    { name: 'Unanswered', value: result.unansweredCount },
  ];

  const barData = result.questions.map((q, i) => ({ name: `Q${i + 1}`, marks: q.marksAwarded }));

  return (
    <div className="qz-result">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <h1 className="qz-result-title">{result.quizTitle}</h1>
      <p className="qz-result-subject">{result.subject}</p>

      <hr className="qz-divider" />

      <div className="qz-stat-grid">
        <div className="qz-stat-box">
          <div className="value">{result.score} / {result.totalMarks}</div>
          <div className="label">Score</div>
        </div>
        <div className="qz-stat-box">
          <div className="value">{result.percentage}%</div>
          <div className="label">Percentage</div>
        </div>
        <div className="qz-stat-box">
          <div className="value">{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</div>
          <div className="label">Time taken</div>
        </div>
        <div className="qz-stat-box">
          <div className="value">{result.correctCount}/{result.correctCount + result.wrongCount + result.unansweredCount}</div>
          <div className="label">Correct answers</div>
        </div>
      </div>

      <hr className="qz-divider" />

      <div className="qz-charts">
        <div className="qz-chart-panel">
          <h3>Answer breakdown</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2} stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="qz-chart-panel">
          <h3>Marks per question</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: STEEL }} axisLine={{ stroke: LINE }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="marks" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {barData.map((d, i) => <Cell key={i} fill={d.marks >= 0 ? CORRECT : WRONG} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr className="qz-divider" />

      <h2 className="qz-review-heading">Answer review</h2>
      <div>
        {result.questions.map((q, qIdx) => (
          <div key={qIdx} className="qz-question-card">
            <div className="qz-question-top">
              <p className="qz-question-text">{qIdx + 1}. {q.questionText}</p>
              {q.isCorrect ? (
                <CheckCircle2 size={20} color={CORRECT} style={{ flexShrink: 0 }} />
              ) : q.selectedOption === null ? (
                <MinusCircle size={20} color={NEUTRAL} style={{ flexShrink: 0 }} />
              ) : (
                <XCircle size={20} color={WRONG} style={{ flexShrink: 0 }} />
              )}
            </div>
            <div className="qz-options">
              {q.options.map((opt, optIdx) => {
                let cls = '';
                if (optIdx === q.correctOption) cls = 'correct';
                else if (optIdx === q.selectedOption) cls = 'incorrect';
                return (
                  <div key={optIdx} className={`qz-option ${cls}`}>
                    <span className="qz-option-letter">{letters[optIdx]}</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
            <p className="qz-question-foot">
              {q.marksAwarded >= 0 ? '+' : ''}{q.marksAwarded} marks
              {q.selectedOption === null ? ' · Not answered' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResult;