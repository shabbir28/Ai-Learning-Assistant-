import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';

export default function FlashcardPage() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [direction, setDirection] = useState(null); // 'left' | 'right'

  useEffect(() => {
    flashcardService.getById(id)
      .then(setSet)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const navigate = useCallback((dir) => {
    if (!set || isAnimating) return;
    const newIndex = dir === 'next'
      ? Math.min(currentIndex + 1, set.cards.length - 1)
      : Math.max(currentIndex - 1, 0);
    if (newIndex === currentIndex) return;

    setDirection(dir === 'next' ? 'right' : 'left');
    setIsAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [set, currentIndex, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const toggleKnown = (e) => {
    e.stopPropagation();
    const card = set.cards[currentIndex];
    setKnown(prev => {
      const next = new Set(prev);
      if (next.has(card._id)) next.delete(card._id); else next.add(card._id);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #f0e6ff', borderTopColor: '#9b51e0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!set || !set.cards || set.cards.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🃏</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>No flashcards found</h2>
        <Link to="/flashcards" style={{ color: '#9b51e0', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back to Decks
        </Link>
      </div>
    );
  }

  const card = set.cards[currentIndex];
  const progress = ((currentIndex + 1) / set.cards.length) * 100;
  const isKnown = known.has(card._id);
  const knownCount = known.size;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fcSpin { to { transform: rotate(360deg) } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft  { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-60px); } }
        @keyframes slideOutLeft  { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(60px); } }
        @keyframes fpFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

        .fp-wrap { max-width: 820px; margin: 0 auto; font-family: 'Inter', sans-serif; animation: fpFade .4s ease-out; padding-bottom: 48px; }

        /* Back link */
        .fp-back { display:inline-flex; align-items:center; gap:8px; color:#64748b; font-size:15px; font-weight:600; text-decoration:none; margin-bottom:28px; transition:color .2s; }
        .fp-back:hover { color:#9b51e0; }
        .fp-back svg { transition:transform .2s; }
        .fp-back:hover svg { transform:translateX(-3px); }

        /* Header */
        .fp-header {
          background:#fff; border-radius:24px; padding:24px 28px; margin-bottom:24px;
          border:1px solid #f0f4ff; box-shadow:0 4px 16px rgba(0,0,0,.04);
          display:flex; align-items:center; gap:16px;
        }
        .fp-header-icon { width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#f0e6ff,#e9d5ff); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fp-title { font-size:22px; font-weight:900; color:#1e293b; line-height:1.2; margin-bottom:4px; }
        .fp-doc-name { font-size:13px; color:#94a3b8; font-weight:500; display:flex; align-items:center; gap:5px; }
        .fp-count-badge { background:linear-gradient(135deg,#9b51e0,#7626b5); color:#fff; border-radius:14px; padding:10px 18px; text-align:center; flex-shrink:0; }
        .fp-count-num { font-size:22px; font-weight:900; line-height:1; }
        .fp-count-lbl { font-size:11px; font-weight:700; opacity:.7; text-transform:uppercase; letter-spacing:.5px; }

        /* Stats bar */
        .fp-stats { display:flex; align-items:center; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
        .fp-stat-item { background:#fff; border:1px solid #f0f4ff; border-radius:12px; padding:8px 16px; display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#475569; box-shadow:0 2px 8px rgba(0,0,0,.03); }

        /* Progress bar */
        .fp-progress-wrap { margin-bottom:24px; }
        .fp-progress-track { height:6px; background:#f1f5f9; border-radius:99px; overflow:hidden; margin-bottom:8px; }
        .fp-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#b573f0,#9b51e0); transition:width .5s cubic-bezier(.4,0,.2,1); }
        .fp-progress-label { display:flex; justify-content:space-between; font-size:13px; font-weight:700; color:#94a3b8; }

        /* Card area */
        .fp-card-area { perspective:1200px; margin-bottom:24px; }
        .fp-card-inner {
          position:relative; min-height:380px; transition:transform .7s cubic-bezier(.4,0,.2,1);
          transform-style:preserve-3d; cursor:pointer;
        }
        .fp-card-inner.flipped { transform:rotateY(180deg); }
        .fp-card-face {
          position:absolute; inset:0; border-radius:28px;
          backface-visibility:hidden; -webkit-backface-visibility:hidden;
          display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 48px;
        }
        .fp-card-front {
          background:#fff; border:1px solid #f0e6ff;
          box-shadow:0 8px 32px rgba(155,81,224,.08);
          transition:box-shadow .3s;
        }
        .fp-card-front:hover { box-shadow:0 16px 48px rgba(155,81,224,.15); }
        .fp-card-back {
          transform:rotateY(180deg);
          background:linear-gradient(145deg,#9b51e0,#7626b5);
          box-shadow:0 12px 40px rgba(155,81,224,.35);
        }
        .fp-badge { padding:6px 16px; border-radius:99px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; margin-bottom:24px; }
        .fp-badge-q { background:#f0e6ff; color:#9b51e0; }
        .fp-badge-a { background:rgba(255,255,255,.2); color:#fff; border:1px solid rgba(255,255,255,.3); }
        .fp-card-text-q { font-size:22px; font-weight:800; color:#1e293b; text-align:center; line-height:1.45; }
        .fp-card-text-a { font-size:20px; font-weight:600; color:#fff; text-align:center; line-height:1.55; }
        .fp-flip-hint { font-size:12px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:.8px; margin-top:28px; display:flex; align-items:center; gap:6px; }
        .fp-card-inner.slide-out-right { animation:slideOutRight .3s forwards; }
        .fp-card-inner.slide-out-left  { animation:slideOutLeft  .3s forwards; }
        .fp-card-inner.slide-in-right  { animation:slideInRight  .3s forwards; }
        .fp-card-inner.slide-in-left   { animation:slideInLeft   .3s forwards; }

        /* Quick action dots */
        .fp-dots { display:flex; justify-content:center; gap:8px; margin-bottom:20px; }
        .fp-dot { width:8px; height:8px; border-radius:99px; background:#e2e8f0; transition:all .3s; cursor:pointer; }
        .fp-dot.active { width:24px; background:#9b51e0; }
        .fp-dot.known { background:#10b981; }

        /* Nav bar */
        .fp-nav { background:#fff; border:1px solid #f0f4ff; border-radius:20px; padding:8px; display:flex; align-items:center; gap:6px; box-shadow:0 4px 16px rgba(0,0,0,.05); }
        .fp-nav-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:14px 12px; border-radius:14px; font-size:14px; font-weight:800; border:none; cursor:pointer; transition:all .2s; }
        .fp-nav-btn-prev { color:#64748b; background:transparent; }
        .fp-nav-btn-prev:not(:disabled):hover { background:#f8fafc; color:#1e293b; }
        .fp-nav-btn-prev:disabled { opacity:.3; cursor:not-allowed; }
        .fp-nav-btn-flip { color:#9b51e0; background:#f0e6ff; }
        .fp-nav-btn-flip:hover { background:#e9d5ff; }
        .fp-nav-btn-next { color:#fff; background:linear-gradient(135deg,#9b51e0,#7626b5); box-shadow:0 6px 18px rgba(155,81,224,.3); }
        .fp-nav-btn-next:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(155,81,224,.4); }
        .fp-nav-btn-next:disabled { background:#e2e8f0; color:#94a3b8; cursor:not-allowed; box-shadow:none; }

        /* Known btn */
        .fp-known-btn { width:44px; height:44px; border-radius:12px; border:2px solid #e2e8f0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
        .fp-known-btn.active { background:#10b981; border-color:#10b981; color:#fff; box-shadow:0 4px 12px rgba(16,185,129,.3); }
        .fp-known-btn:not(.active) { color:#94a3b8; }
        .fp-known-btn:not(.active):hover { border-color:#10b981; color:#10b981; }

        /* Keyboard hint */
        .fp-kb-hint { display:flex; justify-content:center; gap:20px; margin-top:18px; flex-wrap:wrap; }
        .fp-kb-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#94a3b8; font-weight:600; }
        .fp-kb-key { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:3px 8px; font-size:11px; font-family:monospace; color:#64748b; }
      `}</style>

      <div className="fp-wrap">
        <Link to="/flashcards" className="fp-back">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Decks
        </Link>

        {/* Header */}
        <div className="fp-header">
          <div className="fp-header-icon">
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#9b51e0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fp-title">{set.title}</div>
            <div className="fp-doc-name">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {set.document?.originalName || 'Custom Deck'}
            </div>
          </div>
          <div className="fp-count-badge">
            <div className="fp-count-num">{set.cards.length}</div>
            <div className="fp-count-lbl">Cards</div>
          </div>
        </div>

        {/* Stats */}
        <div className="fp-stats">
          <div className="fp-stat-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9b51e0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Card {currentIndex + 1} of {set.cards.length}
          </div>
          <div className="fp-stat-item" style={{ color: '#10b981' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            {knownCount} Known
          </div>
          <div className="fp-stat-item">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f59e0b"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {set.cards.length - knownCount} To Review
          </div>
        </div>

        {/* Progress */}
        <div className="fp-progress-wrap">
          <div className="fp-progress-track">
            <div className="fp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="fp-progress-label">
            <span>{Math.round(progress)}% through deck</span>
            <span>{knownCount}/{set.cards.length} mastered</span>
          </div>
        </div>

        {/* Flip Card */}
        <div className="fp-card-area" onClick={() => setFlipped(f => !f)}>
          <div
            className={`fp-card-inner${flipped ? ' flipped' : ''}${isAnimating && direction === 'right' ? ' slide-out-right' : ''}${isAnimating && direction === 'left' ? ' slide-out-left' : ''}`}
          >
            {/* Front */}
            <div className="fp-card-face fp-card-front">
              {isKnown && (
                <div style={{ position: 'absolute', top: 20, right: 20, background: '#10b981', color: '#fff', borderRadius: 10, padding: '4px 12px', fontSize: 12, fontWeight: 800 }}>✓ Known</div>
              )}
              <div className="fp-badge fp-badge-q">Question</div>
              <p className="fp-card-text-q">{card.question}</p>
              <div className="fp-flip-hint">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Click or press Space to flip
              </div>
            </div>

            {/* Back */}
            <div className="fp-card-face fp-card-back">
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
              <div className="fp-badge fp-badge-a">Answer</div>
              <p className="fp-card-text-a">{card.answer}</p>
            </div>
          </div>
        </div>

        {/* Dot Indicators (max 12) */}
        <div className="fp-dots">
          {set.cards.slice(0, 12).map((c, i) => (
            <div
              key={i}
              className={`fp-dot${i === currentIndex ? ' active' : ''}${known.has(c._id) ? ' known' : ''}`}
              onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(i), 50); }}
            />
          ))}
          {set.cards.length > 12 && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, alignSelf: 'center' }}>+{set.cards.length - 12}</span>}
        </div>

        {/* Navigation */}
        <div className="fp-nav">
          <button
            onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
            disabled={currentIndex === 0}
            className="fp-nav-btn fp-nav-btn-prev"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Prev
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleKnown(e); }}
            className={`fp-known-btn${isKnown ? ' active' : ''}`}
            title={isKnown ? 'Mark as unknown' : 'Mark as known'}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setFlipped(f => !f); }}
            className="fp-nav-btn fp-nav-btn-flip"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {flipped ? 'Question' : 'Flip'}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate('next'); }}
            disabled={currentIndex === set.cards.length - 1}
            className="fp-nav-btn fp-nav-btn-next"
          >
            Next
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="fp-kb-hint">
          <div className="fp-kb-item"><span className="fp-kb-key">←</span> Previous</div>
          <div className="fp-kb-item"><span className="fp-kb-key">Space</span> Flip Card</div>
          <div className="fp-kb-item"><span className="fp-kb-key">→</span> Next</div>
        </div>
      </div>
    </>
  );
}
