import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';

/* SVG countdown ring */
function TimerRing({ remaining, total, color }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = total > 0 ? (remaining / total) * circ : 0;
  const danger = remaining <= Math.ceil(total * 0.25);
  const ringColor = danger ? '#ef4444' : color;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(15,23,42,.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .9s linear, stroke .3s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: danger ? '#ef4444' : '#0f172a',
        transition: 'color .3s',
      }}>
        {remaining}
      </div>
    </div>
  );
}

/* Difficulty badge */
const DIFF_COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const DIFF_BG = { easy: '#f0fdf4', medium: '#fffbeb', hard: '#fef2f2' };

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeTaken, setTimeTaken] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);

  // refs to avoid stale closures inside timer
  const answersRef = useRef({});
  const timeTakenRef = useRef({});
  const currentQRef = useRef(0);
  const quizRef = useRef(null);
  const timeLeftRef = useRef(null);
  const timerRef = useRef(null);
  const qStartRef = useRef(Date.now());

  answersRef.current = answers;
  timeTakenRef.current = timeTaken;
  currentQRef.current = currentQ;
  quizRef.current = quiz;
  timeLeftRef.current = timeLeft;

  /* record how many seconds were spent on the current question */
  const recordTimeTaken = useCallback((qIndex) => {
    const elapsed = Math.round((Date.now() - qStartRef.current) / 1000);
    setTimeTaken((prev) => ({ ...prev, [qIndex.toString()]: elapsed }));
  }, []);

  /* submit (possibly auto-triggered by timer) */
  const doSubmit = useCallback(async (isTimedOut = false) => {
    setSubmitting(true);
    setAutoSubmitting(isTimedOut);
    try {
      await quizService.submit(
        id,
        answersRef.current,
        timeTakenRef.current,
        isTimedOut
      );
      navigate(`/quiz/${id}/result`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setAutoSubmitting(false);
    }
  }, [id, navigate]);

  /* advance to next question OR auto-submit on last */
  const advanceOrSubmit = useCallback(() => {
    const q = currentQRef.current;
    recordTimeTaken(q);
    const total = quizRef.current?.questions?.length ?? 0;
    if (q < total - 1) {
      setCurrentQ(q + 1);
      qStartRef.current = Date.now();
      setTimeLeft(quizRef.current?.timePerQuestion ?? 30);
    } else {
      // last question timed out → auto-submit
      setTimedOut(true);
      doSubmit(true);
    }
  }, [recordTimeTaken, doSubmit]);

  /* load quiz */
  useEffect(() => {
    quizService.getById(id)
      .then((data) => {
        if (data.isCompleted) {
          navigate(`/quiz/${id}/result`, { replace: true });
        } else {
          setQuiz(data);
          quizRef.current = data;
          setTimeLeft(data.timePerQuestion ?? 30);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /* countdown timer */
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft <= 0) {
      advanceOrSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitting, advanceOrSubmit]);

  const handleAnswer = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
    answersRef.current = { ...answersRef.current, [qIndex]: option };
  };

  const goTo = (index) => {
    recordTimeTaken(currentQ);
    setCurrentQ(index);
    qStartRef.current = Date.now();
    setTimeLeft(quiz?.timePerQuestion ?? 30);
  };

  const handleManualSubmit = async () => {
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    recordTimeTaken(currentQ);
    doSubmit(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }
  if (!quiz) return null;
  if (autoSubmitting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
        <div style={{ fontSize: 48 }}>⏰</div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Time's up! Submitting quiz…</p>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / quiz.questions.length) * 100;
  const diffColor = DIFF_COLORS[quiz.difficulty] || '#64748b';
  const diffBg = DIFF_BG[quiz.difficulty] || '#f8fafc';
  const tpq = quiz.timePerQuestion ?? 30;
  const danger = timeLeft !== null && timeLeft <= Math.ceil(tpq * 0.25);

  return (
    <>
      <style>{`
        .qt-page { max-width: 780px; margin: 0 auto; animation: qtFade .35s ease-out; }
        @keyframes qtFade { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }

        /* Header bar */
        .qt-header {
          background: #fff; border-radius: 20px; padding: 18px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 16px rgba(15,23,42,.05);
          border: 1px solid rgba(15,23,42,.06);
          margin-bottom: 20px; flex-wrap: wrap;
        }
        .qt-title { font-size: 17px; font-weight: 800; color: #0f172a; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qt-diff-badge {
          padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700;
          background: var(--bg); color: var(--c); border: 1px solid var(--c);
          white-space: nowrap; flex-shrink: 0;
        }
        .qt-progress-wrap { width: 100%; }
        .qt-progress-meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; }
        .qt-progress-bg { background: #f1f5f9; border-radius: 99px; height: 6px; overflow: hidden; }
        .qt-progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #00c896, #34d399); transition: width .5s; }

        /* Question nav dots */
        .qt-nav-dots { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .qt-dot {
          width: 36px; height: 36px; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer; border: 2px solid transparent;
          transition: all .2s; display: flex; align-items: center; justify-content: center;
        }
        .qt-dot--current { background: #0f172a; color: #fff; border-color: #0f172a; }
        .qt-dot--answered { background: rgba(0,200,150,.12); color: #00c896; border-color: rgba(0,200,150,.3); }
        .qt-dot--empty { background: #f1f5f9; color: #94a3b8; }
        .qt-dot--empty:hover { background: #e2e8f0; }

        /* Question card */
        .qt-card {
          background: #fff; border-radius: 24px; padding: 32px;
          border: 1px solid rgba(15,23,42,.06);
          box-shadow: 0 4px 20px rgba(15,23,42,.06);
          margin-bottom: 20px;
        }
        .qt-q-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .qt-q-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 50px;
          background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700;
        }
        .qt-q-text { font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.55; margin-bottom: 24px; }
        .qt-option {
          width: 100%; text-align: left; padding: 14px 18px;
          border-radius: 14px; border: 2px solid;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all .2s; display: block; margin-bottom: 10px;
        }
        .qt-option--default { border-color: #e2e8f0; background: #f8fafc; color: #475569; }
        .qt-option--default:hover { border-color: #00c896; background: rgba(0,200,150,.04); color: #0f172a; }
        .qt-option--selected { border-color: #00c896; background: rgba(0,200,150,.08); color: #0f172a; }

        /* Timer pulse when danger */
        .qt-danger { animation: qtPulse .8s ease-in-out infinite; }
        @keyframes qtPulse { 0%,100% { opacity:1 } 50% { opacity:.6 } }

        /* Bottom nav */
        .qt-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .qt-btn-nav {
          padding: 11px 22px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
          border: 2px solid #e2e8f0; background: #fff; color: #475569;
          transition: all .2s;
        }
        .qt-btn-nav:hover:not(:disabled) { border-color: #0f172a; color: #0f172a; }
        .qt-btn-nav:disabled { opacity:.4; cursor:not-allowed; }
        .qt-btn-submit {
          padding: 11px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer;
          background: linear-gradient(135deg,#00c896,#009e75); color: #fff; border: none;
          box-shadow: 0 6px 18px rgba(0,200,150,.3); transition: all .2s;
          display: flex; align-items: center; gap: 8px;
        }
        .qt-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,200,150,.35); }
        .qt-btn-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

        @keyframes spin { to { transform:rotate(360deg) } }
        .qt-spin { width:16px; height:16px; border-radius:50%; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; animation:spin .7s linear infinite; }
      `}</style>

      <div className="qt-page">
        <Link to="/quizzes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 14, fontWeight: 600, marginBottom: 18, textDecoration: 'none' }}>
          ← Back to Quizzes
        </Link>

        {/* Header */}
        <div className="qt-header">
          <div className="qt-title">{quiz.title}</div>
          <div className="qt-diff-badge" style={{ '--c': diffColor, '--bg': diffBg }}>
            {quiz.difficulty?.toUpperCase() ?? 'MEDIUM'}
          </div>
          <div className="qt-progress-wrap">
            <div className="qt-progress-meta">
              <span>{totalAnswered} of {quiz.questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="qt-progress-bg">
              <div className="qt-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Question nav dots */}
        <div className="qt-nav-dots">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              className={`qt-dot ${i === currentQ ? 'qt-dot--current' : answers[i] ? 'qt-dot--answered' : 'qt-dot--empty'}`}
              onClick={() => goTo(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="qt-card" key={currentQ}>
          <div className="qt-q-meta">
            <span className="qt-q-badge">
              <span style={{ opacity: .6 }}>Q</span>
              {currentQ + 1} / {quiz.questions.length}
            </span>
            <div className={danger ? 'qt-danger' : ''}>
              <TimerRing remaining={timeLeft ?? tpq} total={tpq} color={diffColor} />
            </div>
          </div>
          <p className="qt-q-text">{question.question}</p>
          <div>
            {question.options.map((option) => (
              <button
                key={option}
                className={`qt-option ${answers[currentQ] === option ? 'qt-option--selected' : 'qt-option--default'}`}
                onClick={() => handleAnswer(currentQ, option)}
              >
                {option}
              </button>
            ))}
          </div>
          {question.explanation && answers[currentQ] && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99,102,241,.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,.15)', fontSize: 13, color: '#6366f1', fontWeight: 500, lineHeight: 1.55 }}>
              💡 <strong>Explanation:</strong> {question.explanation}
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="qt-bottom">
          <button
            className="qt-btn-nav"
            onClick={() => goTo(Math.max(currentQ - 1, 0))}
            disabled={currentQ === 0}
          >
            ← Previous
          </button>

          {currentQ < quiz.questions.length - 1 ? (
            <button className="qt-btn-nav" onClick={() => goTo(currentQ + 1)} style={{ borderColor: '#0f172a', color: '#0f172a' }}>
              Next →
            </button>
          ) : (
            <button className="qt-btn-submit" onClick={handleManualSubmit} disabled={submitting}>
              {submitting ? <span className="qt-spin" /> : '✓'}
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
