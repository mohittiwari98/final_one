import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const styles = `
  .qz-nav {
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

    position: sticky;
    top: 0;
    z-index: 40;
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    background: rgba(247, 245, 240, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .qz-nav-scrolled {
    border-bottom-color: var(--line);
    box-shadow: var(--shadow-sm);
    background: rgba(247, 245, 240, 0.96);
  }
  .qz-nav * { box-sizing: border-box; }

  .qz-nav-inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0.85rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .qz-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--ink);
  }
  .qz-brand-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .qz-brand-word {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: -0.01em;
  }

  .qz-guest-actions { display: flex; gap: 0.6rem; }

  .qz-nav-btn {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.88rem;
    padding: 0.55rem 1.1rem;
    border-radius: 7px;
    cursor: pointer;
    transition: box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
  }
  .qz-nav-btn:active { transform: translateY(1px); }

  .qz-nav-btn-outline {
    background: transparent;
    color: var(--ink);
    border: 1px solid var(--line);
  }
  .qz-nav-btn-outline:hover { border-color: var(--ink); box-shadow: var(--shadow-sm); }

  .qz-nav-btn-solid {
    background: var(--mark);
    color: #fff;
    border: 1px solid var(--mark);
    box-shadow: var(--shadow-sm);
  }
  .qz-nav-btn-solid:hover { background: var(--mark-deep); border-color: var(--mark-deep); box-shadow: var(--shadow-md); }

  .qz-user-menu { position: relative; }

  .qz-user-trigger {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.3rem 0.7rem 0.3rem 0.3rem;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .qz-user-trigger:hover { border-color: var(--line); background: var(--paper-raised); }

  .qz-avatar {
    width: 2.15rem;
    height: 2.15rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: 0.85rem;
    color: #fff;
    flex-shrink: 0;
  }
  .qz-avatar-teacher { background: var(--mark); }
  .qz-avatar-student { background: var(--gold); }

  .qz-user-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
  }
  .qz-user-name { font-size: 0.88rem; font-weight: 600; color: var(--ink); }
  .qz-user-sub { font-size: 0.76rem; color: var(--steel); }

  .qz-chevron { color: var(--steel); transition: transform 0.15s ease; }
  .qz-chevron-open { transform: rotate(180deg); }

  .qz-user-panel {
    position: absolute;
    top: calc(100% + 0.6rem);
    right: 0;
    min-width: 200px;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
  }

  .qz-menu-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    background: none;
    border: none;
    text-decoration: none;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--ink);
    padding: 0.6rem 0.7rem;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s ease;
  }
  .qz-menu-item:hover { background: var(--paper); }
  .qz-menu-item svg { color: var(--steel); flex-shrink: 0; }

  .qz-menu-item-danger { color: var(--mark); }
  .qz-menu-item-danger svg { color: var(--mark); }
  .qz-menu-item-danger:hover { background: var(--gold-soft); }

  .qz-menu-divider {
    border: none;
    border-top: 1px solid var(--line-soft);
    margin: 0.3rem 0.4rem;
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';

  return (
    <header className={`qz-nav ${scrolled ? 'qz-nav-scrolled' : ''}`}>
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
      />

      <div className="qz-nav-inner">
        <Link to="/" className="qz-brand">
          <span className="qz-brand-icon"><GraduationCap size={17} /></span>
          <span className="qz-brand-word">QuizFlow</span>
        </Link>

        {user ? (
          <div className="qz-user-menu" ref={menuRef}>
            <button className="qz-user-trigger" onClick={() => setMenuOpen((o) => !o)}>
              <span className={`qz-avatar qz-avatar-${user.role}`}>{initials(user.name)}</span>
              <span className="qz-user-label">
                <span className="qz-user-name">{user.name}</span>
                <span className="qz-user-sub">{user.role === 'teacher' ? user.subject : user.rollNumber}</span>
              </span>
              <ChevronDown size={16} className={`qz-chevron ${menuOpen ? 'qz-chevron-open' : ''}`} />
            </button>

            {menuOpen && (
              <div className="qz-user-panel">
                <Link to={dashboardPath} className="qz-menu-item" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <hr className="qz-menu-divider" />
                <button className="qz-menu-item qz-menu-item-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="qz-guest-actions">
            <Link to="/teacher/login"><button className="qz-nav-btn qz-nav-btn-outline">Teacher</button></Link>
            <Link to="/student/login"><button className="qz-nav-btn qz-nav-btn-solid">Student</button></Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;