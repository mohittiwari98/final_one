import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';

const LINE = '#DDD7C8';
const STEEL = '#52606D';
const MARK = '#7A2A2A';

const styles = `
  .qz-results {
    --paper: #F7F5F0;
    --paper-raised: #FFFFFF;
    --ink: #1A2230;
    --steel: #52606D;
    --mark: #7A2A2A;
    --mark-deep: #5E1F1F;
    --gold: #A6772E;
    --gold-soft: #F1E6D2;
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
    max-width: 1180px;
    margin: 0 auto;
    padding: 3.5rem 1.5rem 6rem;
  }
  .qz-results * { box-sizing: border-box; }

  .qz-results-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 1.4rem;
    border-bottom: 1px solid var(--line);
  }

  .qz-results-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .qz-results-stats {
    display: flex;
    gap: 2.25rem;
  }

  .qz-stat { text-align: right; }
  .qz-stat-value {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.6rem;
    font-variant-numeric: tabular-nums;
    display: block;
  }
  .qz-stat-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.01em;
  }

  .qz-empty {
    margin-top: 2rem;
    padding: 3rem 2.5rem;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--paper-raised);
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .qz-empty h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.2rem;
    margin: 0 0 0.45rem;
  }
  .qz-empty p { color: var(--steel); margin: 0; }

  .qz-chart-panel {
    margin-top: 2.25rem;
    padding: 1.6rem 1.6rem 0.6rem;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    height: 280px;
    box-shadow: var(--shadow-sm);
  }

  .qz-section-label {
    margin: 3rem 0 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--steel);
  }

  .qz-table-panel {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow-x: auto;
    box-shadow: var(--shadow-sm);
  }

  .qz-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  .qz-table th {
    text-align: left;
    font-weight: 600;
    color: var(--steel);
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }

  .qz-table td {
    padding: 0.8rem 1.1rem;
    border-bottom: 1px solid var(--line-soft);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .qz-table tr:last-child td { border-bottom: none; }
  .qz-table tr:hover td { background: var(--paper); }

  .qz-rank {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
  }
  .qz-rank-top { color: var(--gold); }

  .qz-table-note {
    font-size: 0.82rem;
    color: var(--steel);
    margin-top: 0.8rem;
  }

  .qz-error {
    color: var(--mark);
  }
`;

const QuizAttempts = () => {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/attempts/${quizId}/all`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load results'))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading)
    return (
      <div className="qz-results">
        <style>{styles}</style>
        <p style={{ color: 'var(--steel)' }}>Loading results…</p>
      </div>
    );

  if (error)
    return (
      <div className="qz-results">
        <style>{styles}</style>
        <p className="qz-error">{error}</p>
      </div>
    );

  const chartData = data.results.map((r) => ({ name: r.rollNumber, percentage: r.percentage }));

  return (
    <div className="qz-results">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-results-header">
        <h1 className="qz-results-title">{data.quizTitle}</h1>
        <div className="qz-results-stats">
          <div className="qz-stat">
            <span className="qz-stat-value">{data.totalAttempts}</span>
            <span className="qz-stat-label">submission{data.totalAttempts === 1 ? '' : 's'}</span>
          </div>
          <div className="qz-stat">
            <span className="qz-stat-value">{data.classAverage}%</span>
            <span className="qz-stat-label">class average</span>
          </div>
        </div>
      </div>

      {data.totalAttempts === 0 ? (
        <div className="qz-empty">
          <h3>No submissions yet</h3>
          <p>Results will appear here once students submit.</p>
        </div>
      ) : (
        <>
          <div className="qz-chart-panel">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: STEEL }} axisLine={{ stroke: LINE }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: STEEL }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="percentage" fill={MARK} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="qz-section-label">Every submission, ranked</p>

          <div className="qz-table-panel">
            <table className="qz-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Roll no.</th>
                  <th>Score</th>
                  <th>%</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Unanswered</th>
                  <th>Time taken</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r.attemptId}>
                    <td className={`qz-rank ${r.rank === 1 ? 'qz-rank-top' : ''}`}>{r.rank}</td>
                    <td style={{ fontVariantNumeric: 'normal' }}>{r.studentName}</td>
                    <td>{r.rollNumber}</td>
                    <td>{r.score} / {r.totalMarks}</td>
                    <td>{r.percentage}%</td>
                    <td>{r.correctCount}</td>
                    <td>{r.wrongCount}</td>
                    <td>{r.unansweredCount}</td>
                    <td>{Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="qz-table-note">
            Sorted by percentage, lowest to highest. Rank reflects standing across the whole class.
          </p>
        </>
      )}
    </div>
  );
};

export default QuizAttempts;