import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STREAMS = ['CSE', 'IT', 'ECE', 'AI', 'EE'];

const styles = `
  .qz-register {
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
    --shadow-md: 0 10px 28px -10px rgba(26, 34, 48, 0.22);
    --shadow-lg: 0 20px 48px -14px rgba(26, 34, 48, 0.28);

    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at 15% 10%, rgba(166, 119, 46, 0.06), transparent 45%),
      var(--paper);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }
  .qz-register * { box-sizing: border-box; }

  .qz-register-card {
    width: 100%;
    max-width: 400px;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 2.5rem 2.25rem 2.25rem;
    box-shadow: var(--shadow-lg);
  }

  .qz-register-eyebrow {
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--gold);
  }

  .qz-register-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.7rem;
    letter-spacing: -0.01em;
    margin: 0.45rem 0 0;
  }

  .qz-register-sub {
    color: var(--steel);
    font-size: 0.92rem;
    line-height: 1.5;
    margin: 0.5rem 0 0;
  }

  .qz-field { margin-top: 1.4rem; }
  .qz-field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--steel);
    margin-bottom: 0.4rem;
    letter-spacing: 0.01em;
  }
  .qz-field input,
  .qz-field select {
    width: 100%;
    font-family: inherit;
    font-size: 0.98rem;
    padding: 0.7rem 0.85rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .qz-field input:focus,
  .qz-field select:focus {
    border-color: var(--mark-deep);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(122, 42, 42, 0.1);
  }

  .qz-select-wrap { position: relative; }
  .qz-select-wrap select {
    appearance: none;
    -webkit-appearance: none;
    padding-right: 2.2rem;
    cursor: pointer;
  }
  .qz-select-wrap::after {
    content: '';
    position: absolute;
    right: 0.9rem;
    top: 50%;
    width: 0.55rem;
    height: 0.55rem;
    border-right: 1px solid var(--steel);
    border-bottom: 1px solid var(--steel);
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }

  .qz-error {
    color: var(--mark);
    font-size: 0.88rem;
    margin: 1rem 0 0;
  }

  .qz-submit {
    width: 100%;
    font-family: inherit;
    font-weight: 600;
    font-size: 0.98rem;
    padding: 0.8rem;
    margin-top: 1.6rem;
    background: var(--mark);
    color: #fff;
    border: 1px solid var(--mark);
    border-radius: 6px;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.08s ease;
  }
  .qz-submit:active:not(:disabled) { transform: translateY(1px); }
  .qz-submit:disabled { opacity: 0.6; cursor: default; box-shadow: none; }
  .qz-submit:not(:disabled):hover {
    background: var(--mark-deep);
    border-color: var(--mark-deep);
    box-shadow: var(--shadow-md);
  }

  .qz-register-foot {
    margin-top: 1.6rem;
    font-size: 0.88rem;
    color: var(--steel);
    text-align: center;
  }
  .qz-register-foot a {
    color: var(--ink);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: var(--line);
    text-underline-offset: 2px;
    transition: text-decoration-color 0.15s ease;
  }
  .qz-register-foot a:hover {
    text-decoration-color: var(--ink);
  }
`;

const StudentRegister = () => {
  const [form, setForm] = useState({ name: '', rollNumber: '', stream: STREAMS[0], password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/register', form);
      login(data.token, data.user);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qz-register">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-register-card">
        <span className="qz-register-eyebrow">Student access</span>
        <h2 className="qz-register-title">Create an account</h2>
        <p className="qz-register-sub">See your quizzes and results in one place.</p>

        <form onSubmit={onSubmit}>
          <div className="qz-field">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={onChange} required />
          </div>
          <div className="qz-field">
            <label>Roll number</label>
            <input name="rollNumber" value={form.rollNumber} onChange={onChange} required />
          </div>
          <div className="qz-field">
            <label>Stream</label>
            <div className="qz-select-wrap">
              <select name="stream" value={form.stream} onChange={onChange}>
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="qz-field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} minLength={6} required />
          </div>

          {error && <p className="qz-error">{error}</p>}

          <button className="qz-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="qz-register-foot">
          Already registered? <Link to="/student/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;