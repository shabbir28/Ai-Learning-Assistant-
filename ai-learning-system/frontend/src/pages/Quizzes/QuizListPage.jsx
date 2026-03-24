import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    quizService.getAll()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Quizzes</h1>
          <p className="text-slate-500 mt-1 text-[15px] font-medium">Test your knowledge with AI-generated quizzes</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-20 px-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💡</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No quizzes available</h2>
          <p className="text-slate-500 font-medium text-[15px] mb-8 max-w-sm mx-auto">Upload a document and go to AI Actions to generate interactive quizzes.</p>
          <button 
            onClick={() => navigate('/documents')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Link 
              to={`/quiz/${quiz._id}`} 
              key={quiz._id} 
              className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col hover:border-emerald-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="font-bold text-lg text-slate-900 truncate mb-1" title={quiz.title}>{quiz.title}</h3>
                  <p className="text-[13px] font-medium text-slate-500 truncate" title={quiz.document?.originalName}>
                    {quiz.document?.originalName || 'Unknown Document'}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[13px] font-bold">
                  {quiz.questions?.length || 0} questions
                </span>
                <span className="text-[13px] font-medium text-slate-400">
                  {new Date(quiz.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
