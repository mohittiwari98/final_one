import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const getPhase = (quiz) => {
  const now = new Date();
  if (now < new Date(quiz.startTime)) return { label: 'Upcoming', cls: 'qz-tag-neutral' };
  if (now > new Date(quiz.endTime)) return { label: 'Closed', cls: 'qz-tag-closed' };
  return { label: 'Live', cls: 'qz-tag-live' };
};

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const styles = `
  .qz-tdash {
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
    max-width: 900px;
    margin: 0 auto;
    padding: 3.5rem 1.5rem 6rem;
  }
  .qz-tdash * { box-sizing: border-box; }

  .qz-tdash-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .qz-tdash-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .qz-tdash-sub {
    color: var(--gold);
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    margin-top: 0.4rem;
  }

  .qz-btn {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.7rem 1.3rem;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    white-space: nowrap;
  }
  .qz-btn:active { transform: translateY(1px); }

  .qz-btn-primary {
    background: var(--mark);
    color: #fff;
    border: 1px solid var(--mark);
    box-shadow: var(--shadow-sm);
  }
  .qz-btn-primary:hover {
    background: var(--mark-deep);
    border-color: var(--mark-deep);
    box-shadow: var(--shadow-md);
  }

  .qz-btn-outline {
    background: #fff;
    color: var(--ink);
    border: 1px solid var(--line);
  }
  .qz-btn-outline:hover {
    border-color: var(--ink);
    box-shadow: var(--shadow-sm);
  }

  .qz-divider {
    border: none;
    border-top: 1px solid var(--line);
    margin: 2.5rem 0;
  }

  .qz-empty {
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

  .qz-quiz-list { display: flex; flex-direction: column; gap: 1.1rem; }

  .qz-quiz-card {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 1.6rem 1.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .qz-quiz-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--line-soft);
  }

  .qz-quiz-heading {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-bottom: 0.55rem;
  }
  .qz-quiz-heading h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.2rem;
    margin: 0;
  }

  .qz-tag {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    border: 1px solid transparent;
    letter-spacing: 0.01em;
  }
  .qz-tag-neutral { color: var(--steel); border-color: var(--line); background: var(--paper); }
  .qz-tag-live { color: #fff; background: var(--mark); }
  .qz-tag-closed { color: var(--steel); border-color: var(--line); background: transparent; }

  .qz-quiz-meta {
    font-size: 0.88rem;
    color: var(--steel);
  }

  .qz-quiz-schedule {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--steel);
    margin-top: 0.5rem;
  }

  .qz-error { color: var(--mark); }
`;

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/quizzes/mine')
      .then(({ data }) => setQuizzes(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="qz-tdash">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-tdash-header">
        <div>
          <h1 className="qz-tdash-title">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="qz-tdash-sub">{user.subject}</p>
        </div>
        <Link to="/teacher/quizzes/new">
          <button className="qz-btn qz-btn-primary">
            <Plus size={16} />
            New quiz
          </button>
        </Link>
      </div>

      <hr className="qz-divider" />

      {loading && <p style={{ color: 'var(--steel)' }}>Loading your quizzes…</p>}
      {error && <p className="qz-error">{error}</p>}

      {!loading && quizzes.length === 0 && (
        <div className="qz-empty">
          <h3>No quizzes yet</h3>
          <p>Create your first quiz to start collecting attempts.</p>
        </div>
      )}

      <div className="qz-quiz-list">
        {quizzes.map((quiz) => {
          const phase = getPhase(quiz);
          return (
            <div key={quiz._id} className="qz-quiz-card">
              <div>
                <div className="qz-quiz-heading">
                  <h3>{quiz.title}</h3>
                  <span className={`qz-tag ${phase.cls}`}>{phase.label}</span>
                </div>
                <p className="qz-quiz-meta">
                  {quiz.subject} · {quiz.stream} · {quiz.questions.length} questions · {quiz.totalMarks} marks
                </p>
                <p className="qz-quiz-schedule">
                  <Calendar size={14} />
                  {fmt(quiz.startTime)} → {fmt(quiz.endTime)}
                </p>
              </div>
              <Link to={`/teacher/quizzes/${quiz._id}/attempts`}>
                <button className="qz-btn qz-btn-outline">
                  <Users size={15} />
                  {quiz.attemptCount} attempt{quiz.attemptCount === 1 ? '' : 's'}
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherDashboard;