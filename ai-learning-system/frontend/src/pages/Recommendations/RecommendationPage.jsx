import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../../services/recommendationService';

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.2)',   label: 'High Priority',   dot: '#ef4444' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.2)',  label: 'Medium Priority', dot: '#f59e0b' },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,.08)',   border: 'rgba(34,197,94,.2)',   label: 'Low Priority',    dot: '#22c55e' },
};

const RESOURCE_ICONS = {
  document:  '📄',
  quiz:      '📋',
  flashcard: '🃏',
  review:    '🔁',
};

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: 24,
      border: '1px solid rgba(15,23,42,.06)',
      boxShadow: '0 2px 12px rgba(15,23,42,.04)',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', animation: 'recSkim 1.4s infinite', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, borderRadius: 8, background: '#f1f5f9', width: '50%', marginBottom: 10, animation: 'recSkim 1.4s infinite' }} />
          <div style={{ height: 12, borderRadius: 8, background: '#f1f5f9', width: '85%', marginBottom: 6, animation: 'recSkim 1.4s infinite' }} />
          <div style={{ height: 12, borderRadius: 8, background: '#f1f5f9', width: '65%', animation: 'recSkim 1.4s infinite' }} />
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ item, index }) {
  const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
  const icon = RESOURCE_ICONS[item.resourceType] || '📚';
  return (
    <div
      style={{
        background: '#fff', borderRadius: 22, padding: '24px 26px',
        border: `1px solid ${cfg.border}`,
        boxShadow: '0 2px 16px rgba(15,23,42,.05)',
        animation: `recFade .4s ease-out ${index * 0.07}s both`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* priority stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
        background: cfg.color, borderRadius: '22px 0 0 22px',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 8 }}>
        {/* resource icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.topic}</h3>
            <span style={{
              padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              whiteSpace: 'nowrap',
            }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 10 }}>
            {item.reason}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 12,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
          }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.suggestedAction}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await recommendationService.get();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const result = await recommendationService.refresh();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const highCount   = data?.recommendations?.filter((r) => r.priority === 'high').length ?? 0;
  const medCount    = data?.recommendations?.filter((r) => r.priority === 'medium').length ?? 0;
  const lowCount    = data?.recommendations?.filter((r) => r.priority === 'low').length ?? 0;
  const lastUpdated = data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <>
      <style>{`
        .rec-page { max-width: 900px; margin: 0 auto; animation: recSlide .4s ease-out; }
        @keyframes recSlide { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @keyframes recFade { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes recSkim { 0% { background-color:#f1f5f9 } 50% { background-color:#e2e8f0 } 100% { background-color:#f1f5f9 } }

        .rec-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1a2744 60%, #0f2923 100%);
          border-radius: 28px; padding: 40px 44px; margin-bottom: 28px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,200,150,.12), 0 0 0 1px rgba(255,255,255,.05);
        }
        .rec-hero-glow { position:absolute; top:-60px; right:-60px; width:280px; height:280px; background:radial-gradient(circle,rgba(0,200,150,.2) 0%,transparent 70%); pointer-events:none; }
        .rec-hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .rec-hero-row { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; position:relative; z-index:1; }
        .rec-hero-title { font-size:28px; font-weight:900; color:#fff; letter-spacing:-1px; margin-bottom:8px; }
        .rec-hero-sub { font-size:14px; color:rgba(255,255,255,.45); font-weight:500; margin-bottom:18px; }
        .rec-hero-stats { display:flex; gap:16px; flex-wrap:wrap; }
        .rec-hero-stat { padding:8px 16px; border-radius:50px; font-size:13px; font-weight:700; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.07); color:rgba(255,255,255,.7); }
        .rec-hero-stat span { color:#fff; }

        .rec-refresh-btn {
          padding: 11px 22px; border-radius: 14px;
          font-size: 14px; font-weight: 800;
          background: rgba(255,255,255,.1); color: #fff;
          border: 1px solid rgba(255,255,255,.15); cursor: pointer;
          transition: all .2s; white-space:nowrap;
          display:flex; align-items:center; gap:8px;
        }
        .rec-refresh-btn:hover { background:rgba(255,255,255,.18); }
        .rec-refresh-btn:disabled { opacity:.5; cursor:not-allowed; }

        .rec-summary-box {
          background: rgba(99,102,241,.05); border: 1px solid rgba(99,102,241,.15);
          border-radius: 18px; padding: 18px 22px; margin-bottom: 28px;
          font-size: 14px; line-height: 1.7; color: #334155; font-weight: 500;
          display: flex; gap: 12px; align-items: flex-start;
        }

        .rec-filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
        .rec-filter-chip {
          padding: 7px 16px; border-radius: 50px; font-size: 13px; font-weight: 700;
          border: 2px solid; cursor: pointer; transition: all .2s;
        }

        .rec-grid { display: flex; flex-direction: column; gap: 14px; }

        .rec-empty {
          text-align: center; padding: 60px 24px;
          background: #fff; border-radius: 24px;
          border: 1px solid rgba(15,23,42,.06);
        }
        .rec-empty-icon { font-size: 52px; margin-bottom: 16px; }
        .rec-empty-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .rec-empty-desc { font-size: 14px; color: #94a3b8; max-width: 360px; margin: 0 auto 24px; line-height: 1.6; }

        .rec-error { background:rgba(239,68,68,.06); border:1px solid rgba(239,68,68,.2); border-radius:14px; padding:14px 18px; color:#ef4444; font-size:14px; font-weight:600; margin-bottom:20px; }

        @keyframes spin { to { transform:rotate(360deg) } }
        .rec-spin { width:16px; height:16px; border-radius:50%; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; animation:spin .7s linear infinite; display:inline-block; }
      `}</style>

      <div className="rec-page">
        {/* Hero */}
        <div className="rec-hero">
          <div className="rec-hero-glow" />
          <div className="rec-hero-grid" />
          <div className="rec-hero-row">
            <div>
              <h1 className="rec-hero-title">🧠 Learning Recommendations</h1>
              <p className="rec-hero-sub">Personalized study plan powered by Gemini AI · based on your quiz history</p>
              <div className="rec-hero-stats">
                {data?.generatedFrom?.quizCount > 0 && (
                  <div className="rec-hero-stat">Quizzes Analyzed: <span>{data.generatedFrom.quizCount}</span></div>
                )}
                {data?.generatedFrom?.avgScore > 0 && (
                  <div className="rec-hero-stat">Avg Score: <span>{data.generatedFrom.avgScore}%</span></div>
                )}
                {lastUpdated && (
                  <div className="rec-hero-stat">Updated: <span>{lastUpdated}</span></div>
                )}
              </div>
            </div>
            <button className="rec-refresh-btn" onClick={handleRefresh} disabled={refreshing || loading}>
              {refreshing ? <span className="rec-spin" /> : '🔄'}
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="rec-error">⚠️ {error}</div>}

        {/* AI Summary */}
        {!loading && data?.overallSummary && (
          <div className="rec-summary-box">
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div>{data.overallSummary}</div>
          </div>
        )}

        {/* Priority summary pills */}
        {!loading && data?.recommendations?.length > 0 && (
          <div className="rec-filter-row">
            <div className="rec-filter-chip" style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,.06)', cursor: 'default' }}>
              🔴 High: {highCount}
            </div>
            <div className="rec-filter-chip" style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,.06)', cursor: 'default' }}>
              🟡 Medium: {medCount}
            </div>
            <div className="rec-filter-chip" style={{ borderColor: '#22c55e', color: '#22c55e', background: 'rgba(34,197,94,.06)', cursor: 'default' }}>
              🟢 Low: {lowCount}
            </div>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="rec-grid">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data?.recommendations?.length > 0 ? (
          <div className="rec-grid">
            {/* Sort: high → medium → low */}
            {[...data.recommendations]
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
              })
              .map((item, i) => (
                <RecommendationCard key={i} item={item} index={i} />
              ))}
          </div>
        ) : (
          <div className="rec-empty">
            <div className="rec-empty-icon">📊</div>
            <h2 className="rec-empty-title">No Recommendations Yet</h2>
            <p className="rec-empty-desc">
              Complete at least one quiz to receive personalized AI recommendations tailored to your learning gaps and strengths.
            </p>
            <Link to="/quizzes" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 14,
              background: '#0f172a', color: '#fff',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
            }}>
              Go to Quizzes 📋
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
