import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';

export default function FlashcardPage() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    flashcardService.getById(id)
      .then(setSet)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, set.cards.length - 1)), 200);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!set || !set.cards || set.cards.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No flashcards found</h2>
        <Link to="/documents" className="text-purple-600 hover:text-purple-700 font-semibold inline-flex mt-4 items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Go Back
        </Link>
      </div>
    );
  }

  const card = set.cards[currentIndex];
  // Calculate width accurately, ensure it doesn't exceed 100%
  const progress = Math.min(((currentIndex + 1) / set.cards.length) * 100, 100);

  return (
    <div className="max-w-[800px] mx-auto animate-fade-in pb-12">
      {/* Top Navigation */}
      <Link 
        to="/flashcards" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 font-medium text-[15px] mb-8 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Flashcards
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mb-2 truncate" title={set.title}>{set.title}</h1>
          <p className="text-slate-500 text-[15px] font-medium flex items-center gap-2 truncate">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate" title={set.document?.originalName}>{set.document?.originalName || 'Custom Deck'}</span>
          </p>
        </div>
        <div className="hidden sm:flex bg-[#f0e6ff] text-[#9b51e0] px-4 py-3 rounded-2xl flex-col items-center justify-center flex-shrink-0 min-w-[100px]">
          <span className="text-2xl font-black">{set.cards.length}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">Cards</span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#b573f0] to-[#9b51e0] shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Glossy shine effect on progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-full" />
          </div>
        </div>
        <span className="text-[15px] font-black text-slate-700 w-16 text-right flex-shrink-0">
          {currentIndex + 1} <span className="text-slate-400 font-medium">/ {set.cards.length}</span>
        </span>
      </div>

      {/* Premium Flip Card UI */}
      <div 
        className="relative w-full mb-10 cursor-pointer group" 
        style={{ minHeight: '420px', perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div 
          className="w-full h-full min-h-[420px] transition-transform duration-700 relative"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front of Card (Question) */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center p-8 md:p-12 hover:shadow-[0_8px_40px_rgba(155,81,224,0.1)] transition-shadow duration-300"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="bg-[#f0e6ff] text-[#9b51e0] px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide mb-auto mt-2 uppercase">
              Question
            </div>
            
            <div className="flex-1 flex items-center justify-center w-full my-8">
              <p className="text-center text-[22px] md:text-[26px] text-slate-800 font-bold leading-snug w-full max-w-2xl px-4 text-balance">
                {card.question}
              </p>
            </div>
            
            <div className="mt-auto mb-2 text-slate-400 font-semibold text-[13px] flex items-center gap-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Click to reveal answer
            </div>
          </div>

          {/* Back of Card (Answer) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[32px] flex flex-col items-center p-8 md:p-12 shadow-[0_12px_40px_rgba(155,81,224,0.25)] overflow-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Vibrant gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#9b51e0] via-[#8a38d1] to-[#7626b5] z-0" />
            
            {/* Inner content (z-10 to stay above bg) */}
            <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
               <div className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide mb-auto mt-2 uppercase border border-white/30 shadow-sm">
                Answer
              </div>
              
              <div className="flex-1 flex items-center justify-center w-full my-8">
                <p className="text-center text-[20px] md:text-[24px] text-white font-medium leading-relaxed w-full max-w-2xl px-4 text-balance drop-shadow-sm">
                  {card.answer}
                </p>
              </div>
            </div>
            
            {/* Top right decorative glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full z-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
            currentIndex === 0 
              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        <button 
          onClick={() => setFlipped(!flipped)} 
          className="flex-1 py-4 font-bold text-[#9b51e0] hover:bg-[#f0e6ff] rounded-xl transition-all active:scale-95 text-center"
        >
          {flipped ? 'Question' : 'Flip'}
        </button>

        <button
          onClick={goNext}
          disabled={currentIndex === set.cards.length - 1}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
            currentIndex === set.cards.length - 1
              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' 
              : 'text-[#9b51e0] hover:bg-[#9b51e0] hover:text-white hover:shadow-lg hover:shadow-purple-500/30 active:scale-95'
          }`}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}
