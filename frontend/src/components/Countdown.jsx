import { useEffect, useRef, useState } from 'react';

// Renders a live countdown to `target` (Date or ISO string). Calls onExpire once.
// Same public API as before (target, onExpire, urgentBelowSeconds) — this version
// adds a circular progress ring, a compact mode, and a smoother urgent state.
//
// Color tokens fall back to the app's shared palette (--mark, --gold, --correct,
// --line) when rendered inside one of the qz- pages, but also work standalone
// thanks to the inline fallback values.

const formatDuration = (ms, compact) => {
  if (ms <= 0) return compact ? '0:00' : '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (compact && h === 0) return `${m}:${String(s).padStart(2, '0')}`;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const RADIUS = 22;

const styles = `
  .countdown-ring {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
  }
  .countdown-ring svg { flex-shrink: 0; }
  .countdown-readout {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .countdown-time {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }
  .countdown-caption {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--steel, #52606D);
    letter-spacing: 0.01em;
    margin-top: 0.1rem;
  }
  .countdown-critical svg circle:last-child {
    animation: countdown-pulse 1s ease-in-out infinite;
  }
  @keyframes countdown-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`;

const Countdown = ({ target, onExpire, urgentBelowSeconds = 60, criticalBelowSeconds = 10, size = 'md' }) => {
  const targetMs = new Date(target).getTime();
  const [remaining, setRemaining] = useState(() => targetMs - Date.now());
  const expiredRef = useRef(false);
  // Remembers the first-seen span so the ring has a stable 100% reference point,
  // even though we only ever receive an absolute deadline, not a start time.
  const totalMsRef = useRef(Math.max(targetMs - Date.now(), 1000));

  useEffect(() => {
    expiredRef.current = false;
    totalMsRef.current = Math.max(targetMs - Date.now(), 1000);

    const tick = () => {
      const ms = targetMs - Date.now();
      setRemaining(ms);
      if (ms <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs]);

  const clampedMs = Math.max(remaining, 0);
  const seconds = clampedMs / 1000;
  const progress = Math.min(1, Math.max(0, clampedMs / totalMsRef.current));

  const urgent = seconds <= urgentBelowSeconds;
  const critical = seconds <= criticalBelowSeconds;
  const compact = size === 'sm';

  const diameter = compact ? 44 : 56;
  const stroke = compact ? 4 : 5;
  const r = RADIUS * (diameter / 56);
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  const tone = critical
    ? 'var(--mark, #7A2A2A)'
    : urgent
    ? 'var(--gold, #A6772E)'
    : 'var(--correct, #295640)';

  return (
    <div
      className={`countdown-ring ${critical ? 'countdown-critical' : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatDuration(clampedMs, false)}`}
    >
      <style>{styles}</style>
      <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          fill="none"
          stroke="var(--line-soft, #E9E4D6)"
          strokeWidth={stroke}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="countdown-readout" style={{ color: tone }}>
        <span className="countdown-time">{formatDuration(clampedMs, compact)}</span>
        {!compact && <span className="countdown-caption">{critical ? 'Ending' : urgent ? 'Hurry up' : 'Remaining'}</span>}
      </div>
    </div>
  );
};

export default Countdown;