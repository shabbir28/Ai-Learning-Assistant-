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

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Flashcard Sets</h1>
          <p className="text-slate-500 mt-1 text-[15px] font-medium">Review and study AI-generated flashcards</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse" />)}
        </div>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-20 px-6">
          <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🃏</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No flashcard sets yet</h2>
          <p className="text-slate-500 font-medium text-[15px] mb-8 max-w-sm mx-auto">Upload a document and go to AI Actions to generate interactive flashcards.</p>
          <button 
            onClick={() => navigate('/documents')}
            className="bg-[#9b51e0] hover:bg-[#8540cc] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Link 
              to={`/flashcards/${set._id}`} 
              key={set._id} 
              className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col hover:border-purple-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#f0e6ff] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-7 h-7 text-[#9b51e0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="font-bold text-lg text-slate-900 truncate mb-1" title={set.title}>{set.title}</h3>
                  <p className="text-[13px] font-medium text-slate-500 truncate" title={set.document?.originalName}>
                    {set.document?.originalName || 'Unknown Document'}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="bg-[#f0e6ff] text-[#9b51e0] px-3 py-1 rounded-lg text-[13px] font-bold">
                  {set.cards?.length || 0} cards
                </span>
                <span className="text-[13px] font-medium text-slate-400">
                  {new Date(set.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
