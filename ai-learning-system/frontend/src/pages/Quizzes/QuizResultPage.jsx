import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizService } from '../../services/quizService';

export default function QuizResultPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizService.getResults(id)
      .then(setQuiz)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10 border-4" /></div>;
  if (!quiz) return null;

  const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100);
  const scoreColor = percentage >= 80 ? 'text-emerald-400' : percentage >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = percentage >= 80 ? 'from-emerald-900/40 to-emerald-800/20 border-emerald-700/30' : percentage >= 60 ? 'from-amber-900/40 to-amber-800/20 border-amber-700/30' : 'from-red-900/40 to-red-800/20 border-red-700/30';
  const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚';

  const answersMap = quiz.userAnswers instanceof Map ? Object.fromEntries(quiz.userAnswers) : quiz.userAnswers || {};

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/documents" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      {/* Score Card */}
      <div className={`card bg-gradient-to-br ${scoreBg} border text-center mb-8`}>
        <div className="text-5xl mb-3">{emoji}</div>
        <h1 className="text-2xl font-bold text-white mb-1">{quiz.title}</h1>
        <p className="text-slate-400 text-sm mb-4">{quiz.document?.originalName}</p>
        <div className={`text-7xl font-black ${scoreColor} mb-2`}>{percentage}%</div>
        <p className="text-slate-300">
          You scored <strong>{quiz.score}</strong> out of <strong>{quiz.totalQuestions}</strong>
        </p>
        <p className="text-sm mt-2 text-slate-400">
          {percentage >= 80 ? 'Excellent work! You mastered this topic.' : percentage >= 60 ? 'Good job! Review the missed questions.' : 'Keep studying! You\'ll improve with practice.'}
        </p>
      </div>

      {/* Detailed Results */}
      <h2 className="section-title">Question Review</h2>
      <div className="space-y-4">
        {quiz.questions.map((q, index) => {
          const userAnswer = answersMap[index.toString()] || answersMap[index] || null;
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <div key={index} className={`card border ${isCorrect ? 'border-emerald-700/40 bg-emerald-900/10' : 'border-red-700/40 bg-red-900/10'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium text-sm mb-3">{q.question}</p>
                  {!isCorrect && userAnswer && (
                    <p className="text-red-400 text-sm mb-1">
                      Your answer: <span className="font-medium">{userAnswer}</span>
                    </p>
                  )}
                  {!isCorrect && (
                    <p className="text-emerald-400 text-sm">
                      Correct: <span className="font-medium">{q.correctAnswer}</span>
                    </p>
                  )}
                  {!userAnswer && (
                    <p className="text-slate-500 text-sm italic">Not answered</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/documents" className="btn-primary">Upload New Document</Link>
        <Link to="/flashcards" className="btn-secondary">Review Flashcards</Link>
      </div>
    </div>
  );
}
