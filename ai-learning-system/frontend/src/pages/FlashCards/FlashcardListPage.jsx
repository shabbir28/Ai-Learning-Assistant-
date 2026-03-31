import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';

export default function FlashcardListPage() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    flashcardService.getAll()
      .then(setSets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const CARD_GRADIENTS = [
    ['#9b51e0', '#7626b5'],
    ['#3b82f6', '#1d4ed8'],
    ['#00c896', '#008f69'],
    ['#f59e0b', '#d97706'],
    ['#ef4444', '#b91c1c'],
    ['#8b5cf6', '#6d28d9'],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .fc-page { max-width: 1100px; margin: 0 auto; font-family: 'Inter', sans-serif; }

        /* Hero */
        .fc-hero {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
          border-radius: 28px; padding: 48px 52px; margin-bottom: 36px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
          box-shadow: 0 24px 48px rgba(109,40,217,.25);
        }
        .fc-hero-blob1 { position:absolute; top:-80px; right:-60px; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle, rgba(139,92,246,.4) 0%, transparent 70%); pointer-events:none; }
        .fc-hero-blob2 { position:absolute; bottom:-60px; left:40%; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, rgba(167,139,250,.2) 0%, transparent 70%); pointer-events:none; }
        .fc-hero-icon { width:64px; height:64px; border-radius:20px; background:rgba(255,255,255,.12); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.2); margin-bottom:20px; }
        .fc-hero-title { font-size:34px; font-weight:900; color:#fff; letter-spacing:-1px; margin-bottom:8px; line-height:1.1; }
        .fc-hero-sub { font-size:15px; color:rgba(255,255,255,.65); font-weight:500; line-height:1.6; max-width:400px; }
        .fc-hero-stat { background:rgba(255,255,255,.1); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.15); border-radius:20px; padding:20px 28px; text-align:center; min-width:100px; flex-shrink:0; }
        .fc-hero-stat-num { font-size:32px; font-weight:900; color:#fff; line-height:1; }
        .fc-hero-stat-lbl { font-size:12px; font-weight:700; color:rgba(255,255,255,.5); letter-spacing:.5px; text-transform:uppercase; margin-top:4px; }

        /* Grid */
        .fc-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap:24px; }

        /* Card */
        .fc-card {
          position:relative; border-radius:24px; overflow:hidden; cursor:pointer;
          transition: all .35s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 4px 16px rgba(0,0,0,.06);
          text-decoration:none; display:flex; flex-direction:column;
          border:1px solid rgba(255,255,255,.08);
        }
        .fc-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 40px rgba(0,0,0,.14); }
        .fc-card-top { padding:28px 28px 20px; flex:1; }
        .fc-card-bottom { padding:16px 28px 22px; border-top:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:space-between; }
        .fc-card-chip { background:rgba(255,255,255,.18); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.25); border-radius:20px; padding:6px 14px; font-size:13px; font-weight:800; color:#fff; display:flex; align-items:center; gap:6px; }
        .fc-card-date { font-size:12px; color:rgba(255,255,255,.5); font-weight:600; }
        .fc-card-icon { width:54px; height:54px; border-radius:16px; background:rgba(255,255,255,.15); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; margin-bottom:18px; border:1px solid rgba(255,255,255,.2); }
        .fc-card-title { font-size:19px; font-weight:800; color:#fff; margin-bottom:6px; line-height:1.3; }
        .fc-card-doc { font-size:13px; color:rgba(255,255,255,.6); font-weight:500; display:flex; align-items:center; gap:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fc-card-arrow { width:32px; height:32px; border-radius:10px; background:rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .fc-card:hover .fc-card-arrow { background:rgba(255,255,255,.3); transform:translateX(3px); }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .fc-skeleton { border-radius:24px; height:190px; background:linear-gradient(90deg, #f0f4ff 25%, #e5eaff 50%, #f0f4ff 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; }

        /* Empty */
        .fc-empty { background:#fff; border-radius:28px; border:1px solid #f0f4ff; padding:80px 40px; text-align:center; box-shadow:0 4px 24px rgba(0,0,0,.04); }
        .fc-empty-icon { width:96px; height:96px; border-radius:32px; background:linear-gradient(135deg,#f0e6ff,#e9d5ff); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; }

        @keyframes fcFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .fc-page { animation: fcFade .4s ease-out; }
      `}</style>

      <div className="fc-page">
        {/* HERO */}
        <div className="fc-hero">
          <div className="fc-hero-blob1" />
          <div className="fc-hero-blob2" />
          <div style={{ zIndex: 1 }}>
            <div className="fc-hero-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="fc-hero-title">Flashcard Decks</h1>
            <p className="fc-hero-sub">AI-generated decks ready to help you memorize, review, and master any topic instantly.</p>
          </div>
          <div className="fc-hero-stat" style={{ zIndex: 1 }}>
            <div className="fc-hero-stat-num">{sets.length}</div>
            <div className="fc-hero-stat-lbl">Decks</div>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="fc-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="fc-skeleton" />)}
          </div>
        ) : sets.length === 0 ? (
          <div className="fc-empty">
            <div className="fc-empty-icon">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9b51e0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>No Flashcard Decks Yet</h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Upload a PDF document, then use "AI Actions" to auto-generate your first interactive flashcard deck.
            </p>
            <button
              onClick={() => navigate('/documents')}
              style={{ background: 'linear-gradient(135deg,#9b51e0,#7626b5)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(155,81,224,.3)' }}
            >
              Go to Documents
            </button>
          </div>
        ) : (
          <div className="fc-grid">
            {sets.map((set, idx) => {
              const [from, to] = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
              return (
                <Link
                  to={`/flashcards/${set._id}`}
                  key={set._id}
                  className="fc-card"
                  style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
                >
                  {/* Decorative glow */}
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />

                  <div className="fc-card-top">
                    <div className="fc-card-icon">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="fc-card-title">{set.title}</h3>
                    <p className="fc-card-doc">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {set.document?.originalName || 'Custom Deck'}
                    </p>
                  </div>

                  <div className="fc-card-bottom">
                    <div className="fc-card-chip">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      {set.cards?.length || 0} cards
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="fc-card-date">{new Date(set.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <div className="fc-card-arrow">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
