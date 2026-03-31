import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🌱',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    desc: 'Basic recall & definitions. Perfect for first-time review.',
    tags: ['Key Terms', 'Simple Facts', 'Direct Recall'],
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '⚡',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    desc: 'Comprehension & application. Tests deeper understanding.',
    tags: ['Concepts', 'Application', 'Relationships'],
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔥',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    desc: 'Analysis & synthesis. Challenges critical thinking.',
    tags: ['Critical Thinking', 'Analysis', 'Inference'],
  },
];

const TIME_OPTIONS = [15, 30, 45, 60];
const COUNT_OPTIONS = [5, 10, 15];

export default function QuizGeneratePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');
  const [timePerQ, setTimePerQ] = useState(30);
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const quiz = await quizService.generate(documentId, difficulty, count, timePerQ);
      navigate(`/quiz/${quiz._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate quiz. Try again.');
      setGenerating(false);
    }
  };

  const selected = DIFFICULTIES.find((d) => d.key === difficulty);

  return (
    <>
      <style>{`
        .qg-page { max-width: 780px; margin: 0 auto; animation: qgFade .4s ease-out; }
        @keyframes qgFade { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }

        .qg-heading { font-size: 30px; font-weight: 900; letter-spacing: -1px; color: #0f172a; margin-bottom: 6px; }
        .qg-sub { font-size: 15px; color: #94a3b8; font-weight: 500; margin-bottom: 36px; }

        .qg-section-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
          color: #64748b; margin-bottom: 14px;
        }

        /* Difficulty cards */
        .qg-diff-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 36px; }
        @media(max-width:600px) { .qg-diff-grid { grid-template-columns:1fr; } }

        .qg-diff-card {
          border-radius: 20px; padding: 22px 20px; cursor: pointer;
          border: 2px solid transparent;
          transition: all .25s cubic-bezier(.4,0,.2,1);
          position: relative; overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
        }
        .qg-diff-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(15,23,42,.1); }
        .qg-diff-card--active { border-color: var(--c); background: var(--bg); }
        .qg-diff-card--active::after {
          content:'✓'; position:absolute; top:12px; right:14px;
          font-size:13px; font-weight:900; color:var(--c);
        }
        .qg-diff-emoji { font-size: 28px; margin-bottom: 10px; }
        .qg-diff-label { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .qg-diff-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px; }
        .qg-diff-tags { display:flex; flex-wrap:wrap; gap:6px; }
        .qg-diff-tag {
          font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;
          border:1px solid var(--c); color:var(--c); background:var(--bg);
        }

        /* Options row */
        .qg-options-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px; }
        @media(max-width:560px) { .qg-options-row { grid-template-columns:1fr; } }

        .qg-option-group { background: #fff; border-radius: 20px; padding: 22px; border: 1px solid rgba(15,23,42,.07); box-shadow: 0 2px 12px rgba(15,23,42,.04); }
        .qg-option-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }

        .qg-chip-row { display:flex; gap:8px; flex-wrap:wrap; }
        .qg-chip {
          padding: 8px 16px; border-radius: 50px; border: 2px solid transparent;
          font-size: 14px; font-weight: 700; cursor: pointer;
          background: #f1f5f9; color: #64748b;
          transition: all .2s;
        }
        .qg-chip:hover { background: #e2e8f0; }
        .qg-chip--active { background: #0f172a; color: #fff; border-color: #0f172a; }

        /* Summary bar */
        .qg-summary {
          background: linear-gradient(135deg,#0f172a,#1e293b);
          border-radius: 20px; padding: 22px 28px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 28px;
          box-shadow: 0 12px 32px rgba(15,23,42,.2);
        }
        .qg-summary-chips { display:flex; gap:10px; flex-wrap:wrap; }
        .qg-summary-chip {
          padding: 6px 14px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          background: rgba(255,255,255,.08); color: rgba(255,255,255,.7);
          border: 1px solid rgba(255,255,255,.1);
        }
        .qg-summary-chip span { color: #fff; }

        .qg-btn {
          padding: 14px 32px; border-radius: 14px;
          font-size: 15px; font-weight: 800; letter-spacing: -.2px;
          background: linear-gradient(135deg, #00c896, #009e75);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,200,150,.35);
          transition: all .25s; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
        }
        .qg-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,200,150,.4); }
        .qg-btn:active { transform: translateY(0); }
        .qg-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

        .qg-error {
          background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
          border-radius: 12px; padding: 12px 16px;
          color: #ef4444; font-size: 14px; font-weight: 600;
          margin-top: 14px;
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .qg-spin {
          width:18px; height:18px; border-radius:50%;
          border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          animation: spin .7s linear infinite; display:inline-block;
        }
      `}</style>

      <div className="qg-page">
        <h1 className="qg-heading">Generate Quiz</h1>
        <p className="qg-sub">Choose your difficulty level and quiz settings before generating</p>

        {/* --- Difficulty --- */}
        <div className="qg-section-label">1. Select Difficulty</div>
        <div className="qg-diff-grid">
          {DIFFICULTIES.map((d) => (
            <div
              key={d.key}
              className={`qg-diff-card ${difficulty === d.key ? 'qg-diff-card--active' : ''}`}
              style={{ '--c': d.color, '--bg': d.bg, '--border': d.border }}
              onClick={() => setDifficulty(d.key)}
            >
              <div className="qg-diff-emoji">{d.emoji}</div>
              <div className="qg-diff-label">{d.label}</div>
              <div className="qg-diff-desc">{d.desc}</div>
              <div className="qg-diff-tags">
                {d.tags.map((t) => (
                  <span key={t} className="qg-diff-tag" style={{ '--c': d.color, '--bg': d.bg }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- Options --- */}
        <div className="qg-section-label">2. Configure Quiz</div>
        <div className="qg-options-row">
          <div className="qg-option-group">
            <div className="qg-option-title">⏱ Time per Question</div>
            <div className="qg-chip-row">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`qg-chip ${timePerQ === t ? 'qg-chip--active' : ''}`}
                  onClick={() => setTimePerQ(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
          <div className="qg-option-group">
            <div className="qg-option-title">❓ Number of Questions</div>
            <div className="qg-chip-row">
              {COUNT_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={`qg-chip ${count === c ? 'qg-chip--active' : ''}`}
                  onClick={() => setCount(c)}
                >
                  {c} Qs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Summary + Generate --- */}
        <div className="qg-summary">
          <div className="qg-summary-chips">
            <div className="qg-summary-chip">
              Difficulty: <span style={{ color: selected.color }}>{selected.label}</span>
            </div>
            <div className="qg-summary-chip">
              Questions: <span>{count}</span>
            </div>
            <div className="qg-summary-chip">
              Timer: <span>{timePerQ}s/Q</span>
            </div>
            <div className="qg-summary-chip">
              Total: <span>~{Math.round((count * timePerQ) / 60)} min</span>
            </div>
          </div>
          <button className="qg-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? <span className="qg-spin" /> : '⚡'}
            {generating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>

        {error && <div className="qg-error">⚠️ {error}</div>}
      </div>
    </>
  );
}
