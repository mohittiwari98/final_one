import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const styles = `
  .qz-login {
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
  .qz-login * { box-sizing: border-box; }

  .qz-login-card {
    width: 100%;
    max-width: 380px;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 2.5rem 2.25rem 2.25rem;
    box-shadow: var(--shadow-lg);
  }

  .qz-login-eyebrow {
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--gold);
  }

  .qz-login-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.7rem;
    letter-spacing: -0.01em;
    margin: 0.45rem 0 0;
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
  .qz-field input {
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
  .qz-field input:focus {
    border-color: var(--mark-deep);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(122, 42, 42, 0.1);
  }

  .qz-password-wrap { position: relative; }
  .qz-password-wrap input { padding-right: 2.6rem; }
  .qz-password-toggle {
    position: absolute;
    top: 50%;
    right: 0.55rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--steel);
    cursor: pointer;
    border-radius: 6px;
    transition: color 0.12s ease, background 0.12s ease;
  }
  .qz-password-toggle:hover { color: var(--ink); background: var(--line-soft); }

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

  .qz-login-foot {
    margin-top: 1.6rem;
    font-size: 0.88rem;
    color: var(--steel);
    text-align: center;
  }
  .qz-login-foot a {
    color: var(--ink);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: var(--line);
    text-underline-offset: 2px;
    transition: text-decoration-color 0.15s ease;
  }
  .qz-login-foot a:hover {
    text-decoration-color: var(--ink);
  }
`;

const StudentLogin = () => {
  const [form, setForm] = useState({ rollNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/login', form);
      login(data.token, data.user);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qz-login">
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-login-card">
        <span className="qz-login-eyebrow">Student access</span>
        <h2 className="qz-login-title">Log in</h2>

        <form onSubmit={onSubmit}>
          <div className="qz-field">
            <label>Roll number</label>
            <input name="rollNumber" value={form.rollNumber} onChange={onChange} required />
          </div>
          <div className="qz-field">
            <label>Password</label>
            <div className="qz-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                className="qz-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && <p className="qz-error">{error}</p>}

          <button className="qz-submit" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="qz-login-foot">
          New here? <Link to="/student/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;