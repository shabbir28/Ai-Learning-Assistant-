import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    quizService.getById(id)
      .then((data) => {
        if (data.isCompleted) {
          navigate(`/quiz/${id}/result`, { replace: true });
        } else {
          setQuiz(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return;
    }
    setSubmitting(true);
    try {
      await quizService.submit(id, answers);
      navigate(`/quiz/${id}/result`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10 border-4" /></div>;
  if (!quiz) return null;

  const question = quiz.questions[currentQ];
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / quiz.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/documents" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{totalAnswered} of {quiz.questions.length} answered</p>
        <div className="mt-3 bg-slate-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
              i === currentQ
                ? 'bg-primary-600 text-white'
                : answers[i]
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      <div className="card mb-6 animate-fade-in" key={currentQ}>
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-blue">Question {currentQ + 1}</span>
        </div>
        <p className="text-lg text-slate-800 font-medium mb-6 leading-relaxed">{question.question}</p>
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(currentQ, option)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                answers[currentQ] === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-slate-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => setCurrentQ((i) => Math.max(i - 1, 0))} disabled={currentQ === 0} className="btn-secondary disabled:opacity-40">
          ← Previous
        </button>
        {currentQ < quiz.questions.length - 1 ? (
          <button onClick={() => setCurrentQ((i) => i + 1)} className="btn-primary">
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <div className="spinner" /> : null}
            {submitting ? 'Submitting...' : '✓ Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
