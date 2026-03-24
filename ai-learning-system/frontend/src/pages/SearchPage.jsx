import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { flashcardService } from '../services/flashcardService';
import { quizService } from '../services/quizService';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ documents: [], flashcards: [], quizzes: [] });

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch all resources and filter locally
    Promise.all([
      documentService.getAll().catch(() => []),
      flashcardService.getAll().catch(() => []),
      quizService.getAll().catch(() => [])
    ]).then(([docs, cards, quizzes]) => {
      const q = query.toLowerCase();
      setResults({
        documents: docs.filter(d => d.originalName?.toLowerCase().includes(q)),
        flashcards: cards.filter(f => f.title?.toLowerCase().includes(q) || f.document?.originalName?.toLowerCase().includes(q)),
        quizzes: quizzes.filter(qz => qz.title?.toLowerCase().includes(q) || qz.document?.originalName?.toLowerCase().includes(q))
      });
    }).finally(() => {
      setLoading(false);
    });
  }, [query]);

  if (!query) {
    return (
      <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 mb-8">Search</h1>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">Please enter a search query in the top bar.</p>
        </div>
      </div>
    );
  }

  const totalResults = results.documents.length + results.flashcards.length + results.quizzes.length;

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Search Results</h1>
          <p className="text-slate-500 mt-1 text-[15px] font-medium">
            Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for <span className="text-emerald-600 font-bold">"{query}"</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
           <div className="h-40 bg-white rounded-3xl border border-slate-100"></div>
           <div className="h-40 bg-white rounded-3xl border border-slate-100"></div>
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-20 px-6">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-slate-400">🕵️‍♀️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No results found</h2>
          <p className="text-slate-500 font-medium text-[15px] mb-8 max-w-sm mx-auto">We couldn't find anything matching "{query}". Try checking your spelling or using different keywords.</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Documents Section */}
          {results.documents.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Documents ({results.documents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.documents.map(doc => (
                  <Link to={`/documents/${doc._id}`} key={doc._id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate" title={doc.originalName}>{doc.originalName}</p>
                      <p className="text-xs text-slate-500">Document</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Flashcards Section */}
          {results.flashcards.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Flashcards ({results.flashcards.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.flashcards.map(fc => (
                  <Link to={`/flashcards/${fc._id}`} key={fc._id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate" title={fc.title}>{fc.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{fc.document?.originalName || 'Flashcard Set'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Quizzes Section */}
          {results.quizzes.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Quizzes ({results.quizzes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.quizzes.map(qz => (
                  <Link to={`/quiz/${qz._id}`} key={qz._id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate" title={qz.title}>{qz.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{qz.document?.originalName || 'Quiz'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
