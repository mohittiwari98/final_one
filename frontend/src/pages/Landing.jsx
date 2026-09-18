import { Link } from 'react-router-dom';
import { PenSquare, Timer, BarChart3 } from 'lucide-react';

const Landing = () => (
  <div className="qz-landing">
    <style>{`
      .qz-landing {
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
        --shadow-lg: 0 24px 56px -18px rgba(26, 34, 48, 0.3);

        font-family: 'IBM Plex Sans', -apple-system, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at 85% -5%, rgba(166, 119, 46, 0.08), transparent 42%),
          var(--paper);
        max-width: 1180px;
        margin: 0 auto;
        padding: 5rem 1.5rem 6rem;
      }

      .qz-landing * { box-sizing: border-box; }

      .qz-hero {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 4rem;
        align-items: start;
      }

      .qz-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--gold);
      }
      .qz-eyebrow::before {
        content: '';
        width: 1.4rem;
        height: 1px;
        background: var(--gold);
      }

      .qz-headline {
        font-family: 'Fraunces', Georgia, serif;
        font-size: clamp(2.5rem, 4.2vw, 3.5rem);
        font-weight: 500;
        line-height: 1.12;
        letter-spacing: -0.015em;
        margin: 1.3rem 0 1.5rem;
        max-width: 15ch;
      }

      .qz-sub {
        font-size: 1.08rem;
        line-height: 1.65;
        color: var(--steel);
        max-width: 46ch;
      }

      .qz-actions {
        display: flex;
        gap: 0.9rem;
        margin-top: 2.5rem;
      }

      .qz-btn {
        font-family: inherit;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.85rem 1.6rem;
        border-radius: 7px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.12s ease, background 0.15s ease, box-shadow 0.15s ease;
      }
      .qz-btn:active { transform: translateY(1px); }

      .qz-btn-primary {
        background: var(--ink);
        color: var(--paper);
        box-shadow: var(--shadow-sm);
      }
      .qz-btn-primary:hover { background: #0D1522; box-shadow: var(--shadow-md); }

      .qz-btn-ghost {
        background: transparent;
        border-color: var(--line);
        color: var(--ink);
      }
      .qz-btn-ghost:hover { border-color: var(--ink); box-shadow: var(--shadow-sm); }

      /* Hero specimen: a mock quiz cover sheet */
      .qz-specimen {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 1.9rem 1.9rem 1.6rem;
        box-shadow: var(--shadow-lg);
      }

      .qz-specimen-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid var(--line);
        padding-bottom: 1rem;
        margin-bottom: 1rem;
      }

      .qz-specimen-title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 1.15rem;
      }

      .qz-specimen-status {
        font-size: 0.75rem;
        font-weight: 600;
        color: #fff;
        background: var(--mark);
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
      }

      .qz-specimen-row {
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--line-soft);
        font-size: 0.92rem;
      }
      .qz-specimen-row:last-of-type { border-bottom: none; }

      .qz-specimen-label { color: var(--steel); }
      .qz-specimen-value {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }

      .qz-specimen-foot {
        margin-top: 1.1rem;
        font-size: 0.85rem;
        color: var(--steel);
      }

      .qz-divider {
        border: none;
        border-top: 1px solid var(--line);
        margin: 4.5rem 0 3rem;
      }

      .qz-features {
        display: flex;
        flex-direction: column;
      }

      .qz-feature {
        display: grid;
        grid-template-columns: 2.75rem 1fr;
        gap: 1.5rem;
        padding: 1.9rem 0;
        border-top: 1px solid var(--line);
      }
      .qz-feature:last-child { border-bottom: 1px solid var(--line); }

      .qz-feature-icon {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 50%;
        background: var(--gold-soft);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .qz-feature-icon svg { color: var(--mark); }

      .qz-feature h3 {
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 500;
        font-size: 1.18rem;
        margin: 0 0 0.4rem;
      }

      .qz-feature p {
        color: var(--steel);
        font-size: 0.98rem;
        line-height: 1.6;
        margin: 0;
        max-width: 52ch;
      }

      @media (max-width: 780px) {
        .qz-hero { grid-template-columns: 1fr; }
        .qz-actions { flex-direction: column; }
        .qz-btn { width: 100%; text-align: center; }
      }
    `}</style>

    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:wght@450;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap"
    />

    <div className="qz-hero">
      <div>
        <span className="qz-eyebrow">For schools running real exams online</span>
        <h1 className="qz-headline">Quizzes that grade themselves the moment they close.</h1>
        <p className="qz-sub">
          Set a start time, an end time and a duration. Every student gets one attempt,
          timed and marked by the server — not the browser — so nothing depends on a
          spreadsheet or someone staying up late to tally scores.
        </p>
        <div className="qz-actions">
          <Link to="/teacher/register">
            <button className="qz-btn qz-btn-primary">I teach — set up a quiz</button>
          </Link>
          <Link to="/student/register">
            <button className="qz-btn qz-btn-ghost">I'm taking a quiz</button>
          </Link>
        </div>
      </div>

      <div className="qz-specimen">
        <div className="qz-specimen-top">
          <span className="qz-specimen-title">Algebra II — Midterm</span>
          <span className="qz-specimen-status">Open now</span>
        </div>
        <div className="qz-specimen-row">
          <span className="qz-specimen-label">Starts</span>
          <span className="qz-specimen-value">9:00 AM</span>
        </div>
        <div className="qz-specimen-row">
          <span className="qz-specimen-label">Ends</span>
          <span className="qz-specimen-value">10:30 AM</span>
        </div>
        <div className="qz-specimen-row">
          <span className="qz-specimen-label">Duration</span>
          <span className="qz-specimen-value">45 min, once started</span>
        </div>
        <div className="qz-specimen-row">
          <span className="qz-specimen-label">Attempts</span>
          <span className="qz-specimen-value">1</span>
        </div>
        <p className="qz-specimen-foot">
          Graded instantly on submit. Late arrivals get whatever time remains in the window.
        </p>
      </div>
    </div>

    <hr className="qz-divider" />

    <div className="qz-features">
      <div className="qz-feature">
        <div className="qz-feature-icon">
          <PenSquare size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h3>Build a quiz in minutes</h3>
          <p>Set subject, stream, schedule and negative marking, question by question.</p>
        </div>
      </div>
      <div className="qz-feature">
        <div className="qz-feature-icon">
          <Timer size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h3>Deadlines the server enforces</h3>
          <p>Timing and the one-attempt rule are checked server-side, never trusted from the browser.</p>
        </div>
      </div>
      <div className="qz-feature">
        <div className="qz-feature-icon">
          <BarChart3 size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h3>Results, ranked and charted</h3>
          <p>Score, percentage, rank and class average, with a breakdown for every student.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;