import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';

/* ── tiny animated count-up hook ── */
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return display;
}

/* ── SVG circular progress ring ── */
function Ring({ value = 0, size = 120, stroke = 10, color = '#00c896', bg = 'rgba(255,255,255,0.08)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

/* ── stat card with icon ── */
function StatCard({ label, value, icon, color, glow }) {
  const count = useCountUp(value);
  return (
    <div className="profile-stat-card" style={{ '--glow': glow }}>
      <div className="profile-stat-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <p className="profile-stat-value" style={{ color }}>{count}</p>
      <p className="profile-stat-label">{label}</p>
    </div>
  );
}

/* ── achievement badge ── */
function Badge({ icon, title, subtitle, unlocked }) {
  return (
    <div className={`profile-badge ${unlocked ? 'profile-badge--unlocked' : 'profile-badge--locked'}`}>
      <div className="profile-badge-icon">{icon}</div>
      <div>
        <p className="profile-badge-title">{title}</p>
        <p className="profile-badge-sub">{subtitle}</p>
      </div>
      {unlocked && <div className="profile-badge-check">✓</div>}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    aiService.getDashboard()
      .then((data) => { setStats(data?.stats); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  /* parallax tilt on hero card */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handle = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) scale(1.01)`;
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', handle);
    el.addEventListener('mouseleave', reset);
    return () => { el.removeEventListener('mousemove', handle); el.removeEventListener('mouseleave', reset); };
  }, []);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const avgScore = stats?.avgScore ?? 0;
  const scoreCount = useCountUp(avgScore);

  const achievements = [
    { icon: '📄', title: 'Document Master', subtitle: `${stats?.totalDocuments ?? 0} docs uploaded`, unlocked: (stats?.totalDocuments ?? 0) >= 1 },
    { icon: '🃏', title: 'Flash Learner', subtitle: `${stats?.totalFlashcardSets ?? 0} flashcard sets`, unlocked: (stats?.totalFlashcardSets ?? 0) >= 1 },
    { icon: '🎯', title: 'Quiz Champion', subtitle: `${stats?.completedQuizzes ?? 0} quizzes done`, unlocked: (stats?.completedQuizzes ?? 0) >= 3 },
    { icon: '🔥', title: 'High Scorer', subtitle: 'Avg score above 80%', unlocked: avgScore >= 80 },
  ];

  return (
    <>
      <style>{`
        /* ── Page Shell ── */
        .profile-page {
          max-width: 1100px;
          margin: 0 auto;
          padding-bottom: 80px;
          animation: profileFadeIn .45s ease-out;
        }
        @keyframes profileFadeIn { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }

        /* ── Hero Card ── */
        .profile-hero {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          background: linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f2923 100%);
          padding: 48px 52px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 40px;
          transition: transform .4s cubic-bezier(.4,0,.2,1), box-shadow .4s;
          box-shadow: 0 30px 80px rgba(0,200,150,.12), 0 0 0 1px rgba(255,255,255,.05);
          cursor: default;
          will-change: transform;
        }
        .profile-hero-glow1 {
          position: absolute; top: -80px; right: -80px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(0,200,150,.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .profile-hero-glow2 {
          position: absolute; bottom: -60px; left: 40%;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .profile-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Avatar */
        .profile-avatar-wrap { position: relative; flex-shrink: 0; z-index: 2; }
        .profile-avatar {
          width: 110px; height: 110px;
          border-radius: 28px;
          background: linear-gradient(135deg, #00c896, #009e75);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; font-weight: 900; color: #fff; letter-spacing: -1px;
          box-shadow: 0 16px 40px rgba(0,200,150,.4), 0 0 0 3px rgba(0,200,150,.2);
          position: relative;
        }
        .profile-avatar-ring {
          position: absolute; inset: -6px;
          border-radius: 34px;
          border: 2px solid transparent;
          background: linear-gradient(135deg, #00c896, #6366f1) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          pointer-events: none;
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%,100% { opacity:.7 } 50% { opacity:1 } }
        .profile-avatar-badge {
          position: absolute; bottom: -8px; right: -8px;
          width: 30px; height: 30px;
          border-radius: 10px;
          background: #0f172a;
          border: 2px solid rgba(255,255,255,.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,.5);
          z-index: 3;
        }

        /* Hero text */
        .profile-hero-info { z-index: 2; flex: 1; min-width: 0; }
        .profile-hero-name {
          font-size: 36px; font-weight: 900; color: #fff;
          letter-spacing: -1.5px; line-height: 1; margin-bottom: 6px;
        }
        .profile-hero-email {
          font-size: 15px; color: rgba(255,255,255,.45); font-weight: 500; margin-bottom: 20px;
        }
        .profile-hero-tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .profile-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px; font-weight: 700; letter-spacing: .4px;
        }
        .profile-tag--green {
          background: rgba(0,200,150,.15);
          color: #00c896;
          border: 1px solid rgba(0,200,150,.25);
        }
        .profile-tag--purple {
          background: rgba(99,102,241,.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,.25);
        }
        .profile-tag--amber {
          background: rgba(251,191,36,.1);
          color: #fbbf24;
          border: 1px solid rgba(251,191,36,.2);
        }

        /* Score ring in hero */
        .profile-score-wrap {
          z-index: 2; flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          position: relative;
        }
        .profile-score-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .profile-score-num {
          font-size: 26px; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -1px;
        }
        .profile-score-pct { font-size: 13px; color: #00c896; font-weight: 700; }
        .profile-score-label {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,.4);
          text-transform: uppercase; letter-spacing: .6px; margin-top: 4px;
        }

        /* ── Stats Grid ── */
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) { .profile-stats-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .profile-stats-grid { grid-template-columns: 1fr 1fr; } }

        .profile-stat-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,.06);
          border-radius: 24px;
          padding: 26px 22px;
          display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
          transition: transform .25s, box-shadow .25s;
          box-shadow: 0 2px 16px rgba(15,23,42,.04);
          position: relative;
          overflow: hidden;
        }
        .profile-stat-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--glow);
          opacity: 0;
          transition: opacity .3s;
        }
        .profile-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(15,23,42,.1); }
        .profile-stat-card:hover::after { opacity: 1; }

        .profile-stat-icon {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .profile-stat-value {
          font-size: 38px; font-weight: 900; letter-spacing: -2px; line-height: 1;
        }
        .profile-stat-label {
          font-size: 13px; font-weight: 600; color: #94a3b8;
          text-transform: uppercase; letter-spacing: .5px;
        }

        /* ── Bottom Grid ── */
        .profile-bottom {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 22px;
        }
        @media (max-width: 820px) { .profile-bottom { grid-template-columns: 1fr; } }

        /* Achievements Panel */
        .profile-panel {
          background: #fff;
          border: 1px solid rgba(15,23,42,.06);
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 2px 16px rgba(15,23,42,.04);
        }
        .profile-panel-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .profile-panel-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: #f1f5f9;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .profile-panel-title {
          font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -.5px;
        }

        /* Badge rows */
        .profile-badge {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-radius: 18px;
          margin-bottom: 10px;
          border: 1px solid;
          transition: transform .2s, box-shadow .2s;
          position: relative;
        }
        .profile-badge:hover { transform: translateX(4px); }
        .profile-badge--unlocked {
          background: linear-gradient(90deg, rgba(0,200,150,.05) 0%, rgba(0,200,150,.02) 100%);
          border-color: rgba(0,200,150,.18);
        }
        .profile-badge--locked {
          background: #f8fafc;
          border-color: rgba(15,23,42,.06);
          opacity: .55;
          filter: grayscale(.6);
        }
        .profile-badge-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(0,200,150,.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .profile-badge--locked .profile-badge-icon { background: #f1f5f9; }
        .profile-badge-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .profile-badge-sub { font-size: 12px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
        .profile-badge-check {
          margin-left: auto; width: 22px; height: 22px; border-radius: 50%;
          background: #00c896; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; flex-shrink: 0;
        }

        /* Score Panel (right column) */
        .profile-score-panel {
          background: linear-gradient(160deg, #0f172a 0%, #1e2d4a 100%);
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,200,150,.1), 0 0 0 1px rgba(255,255,255,.05);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .profile-score-panel-glow {
          position: absolute; top: -60px; right: -60px;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(0,200,150,.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .profile-score-panel-title {
          font-size: 19px; font-weight: 800; color: #fff; letter-spacing: -.4px; margin-bottom: 6px;
          position: relative; z-index: 1;
        }
        .profile-score-panel-sub {
          font-size: 13px; color: rgba(255,255,255,.38); font-weight: 500; margin-bottom: 28px;
          position: relative; z-index: 1;
        }
        .profile-score-ring-wrap {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          position: relative; z-index: 1; margin-bottom: auto;
        }
        .profile-score-big { font-size: 56px; font-weight: 900; color: #fff; letter-spacing: -3px; line-height: 1; }
        .profile-score-pct2 { font-size: 22px; color: #00c896; font-weight: 800; }
        .profile-score-desc { font-size: 13px; color: rgba(255,255,255,.35); font-weight: 500; margin-top: 4px; }

        .profile-score-bar-section { position: relative; z-index: 1; margin-top: 28px; }
        .profile-score-bar-label {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
        }
        .profile-score-bar-text { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .5px; }
        .profile-score-bar-bg {
          background: rgba(255,255,255,.08); border-radius: 99px; height: 10px; overflow: hidden;
          border: 1px solid rgba(255,255,255,.05);
        }
        .profile-score-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #00c896, #34d399);
          box-shadow: 0 0 12px rgba(0,200,150,.5);
          transition: width 1.4s cubic-bezier(.4,0,.2,1);
          position: relative;
        }
        .profile-score-bar-fill::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 50%; border-radius: 99px;
          background: rgba(255,255,255,.25);
        }

        /* Progress items */
        .profile-progress-item { margin-bottom: 18px; }
        .profile-progress-row {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
        }
        .profile-progress-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.6); }
        .profile-progress-pct { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.4); }
        .profile-progress-bg {
          background: rgba(255,255,255,.06); border-radius: 99px; height: 6px; overflow: hidden;
        }
        .profile-progress-fill { height: 100%; border-radius: 99px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }

        /* Skeleton */
        .profile-skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 24px; }
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

        /* Hero responsive */
        @media (max-width: 700px) {
          .profile-hero { flex-direction: column; text-align: center; padding: 36px 28px; gap: 24px; }
          .profile-hero-tags { justify-content: center; }
          .profile-hero-name { font-size: 28px; }
          .profile-score-wrap { display: none; }
        }
      `}</style>

      <div className="profile-page">

        {/* Page heading */}
        <div style={{ marginBottom: 28, paddingLeft: 4 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1, color: '#0f172a', lineHeight: 1 }}>Your Profile</h1>
          <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 15, fontWeight: 500 }}>Manage your account and track your learning journey</p>
        </div>

        {/* ── Hero Card ── */}
        <div className="profile-hero" ref={heroRef}>
          <div className="profile-hero-glow1" />
          <div className="profile-hero-glow2" />
          <div className="profile-hero-grid" />

          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-avatar-ring" />
            <div className="profile-avatar-badge" title="Verified Learner">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="#00c896"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          </div>

          <div className="profile-hero-info">
            <h2 className="profile-hero-name">{user?.name ?? 'Learner'}</h2>
            <p className="profile-hero-email">{user?.email}</p>
            <div className="profile-hero-tags">
              <span className="profile-tag profile-tag--green">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                Active Learner
              </span>
              <span className="profile-tag profile-tag--purple">
                ⚡ Pro Plan
              </span>
              {avgScore >= 80 && (
                <span className="profile-tag profile-tag--amber">🏆 High Scorer</span>
              )}
            </div>
          </div>

          {/* Average score ring */}
          <div className="profile-score-wrap">
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <Ring value={loaded ? avgScore : 0} size={120} stroke={9} color="#00c896" bg="rgba(255,255,255,0.08)" />
              <div className="profile-score-inner">
                <span className="profile-score-num">{loaded ? scoreCount : '--'}</span>
                <span className="profile-score-pct">%</span>
              </div>
            </div>
            <span className="profile-score-label">Avg Score</span>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="profile-stats-grid">
          {!loaded ? (
            [...Array(4)].map((_, i) => <div key={i} className="profile-skeleton" style={{ height: 130 }} />)
          ) : (
            <>
              <StatCard label="Documents" value={stats?.totalDocuments ?? 0} icon="📄" color="#0091ff" glow="linear-gradient(90deg,#0091ff,#38bdf8)" />
              <StatCard label="Flashcard Sets" value={stats?.totalFlashcardSets ?? 0} icon="🃏" color="#9b51e0" glow="linear-gradient(90deg,#9b51e0,#a78bfa)" />
              <StatCard label="Total Quizzes" value={stats?.totalQuizzes ?? 0} icon="📋" color="#00c896" glow="linear-gradient(90deg,#00c896,#34d399)" />
              <StatCard label="Completed" value={stats?.completedQuizzes ?? 0} icon="✅" color="#ff7a00" glow="linear-gradient(90deg,#ff7a00,#fb923c)" />
            </>
          )}
        </div>

        {/* ── Bottom Grid ── */}
        <div className="profile-bottom">

          {/* Achievements */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <div className="profile-panel-icon">🏅</div>
              <h2 className="profile-panel-title">Achievements</h2>
            </div>
            {!loaded
              ? [...Array(4)].map((_, i) => <div key={i} className="profile-skeleton" style={{ height: 68, marginBottom: 10 }} />)
              : achievements.map((a) => <Badge key={a.title} {...a} />)
            }
          </div>

          {/* Score & Progress Panel */}
          <div className="profile-score-panel">
            <div className="profile-score-panel-glow" />
            <div className="profile-score-panel-title">Performance</div>
            <div className="profile-score-panel-sub">Across {stats?.completedQuizzes ?? 0} completed quizzes</div>

            <div className="profile-score-ring-wrap">
              <div style={{ position: 'relative', width: 150, height: 150 }}>
                <Ring value={loaded ? avgScore : 0} size={150} stroke={12} color="#00c896" bg="rgba(255,255,255,0.07)" />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="profile-score-big">{loaded ? scoreCount : '--'}<span className="profile-score-pct2">%</span></span>
                  <span className="profile-score-desc">Average Score</span>
                </div>
              </div>
            </div>

            <div className="profile-score-bar-section">
              <div className="profile-score-bar-label">
                <span className="profile-score-bar-text">Score</span>
                <span className="profile-score-bar-text">{avgScore}%</span>
              </div>
              <div className="profile-score-bar-bg">
                <div className="profile-score-bar-fill" style={{ width: loaded ? `${avgScore}%` : '0%' }} />
              </div>

              {/* Mini skill bars */}
              <div style={{ marginTop: 24 }}>
                {[
                  { name: 'Documents', val: Math.min(100, (stats?.totalDocuments ?? 0) * 20), color: 'linear-gradient(90deg,#0091ff,#38bdf8)' },
                  { name: 'Flashcards', val: Math.min(100, (stats?.totalFlashcardSets ?? 0) * 25), color: 'linear-gradient(90deg,#9b51e0,#a78bfa)' },
                  { name: 'Quizzes', val: Math.min(100, (stats?.completedQuizzes ?? 0) * 15), color: 'linear-gradient(90deg,#00c896,#34d399)' },
                ].map(({ name, val, color }) => (
                  <div key={name} className="profile-progress-item">
                    <div className="profile-progress-row">
                      <span className="profile-progress-name">{name}</span>
                      <span className="profile-progress-pct">{val}%</span>
                    </div>
                    <div className="profile-progress-bg">
                      <div className="profile-progress-fill" style={{ width: loaded ? `${val}%` : '0%', background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
