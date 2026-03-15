import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    aiService.getDashboard().then((data) => setStats(data?.stats)).catch(console.error);
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in pb-12">
      <div className="mb-8 pl-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Your Profile</h1>
        <p className="text-slate-500 mt-1 text-[15px] font-medium">Manage your account and view learning statistics</p>
      </div>

      {/* Premium Avatar & Info Card */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 mb-8 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#00c896] to-[#009e75] flex items-center justify-center text-white text-[42px] font-black shadow-[0_12px_30px_rgba(0,200,150,0.3)] shrink-0 z-10 relative">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {/* Decorative small circle */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 p-1.5 z-20 tooltip" title="Verified Learner">
             <svg className="w-full h-full text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
             </svg>
          </div>
        </div>

        <div className="text-center md:text-left z-10">
          <h2 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-none mb-2">{user?.name}</h2>
          <p className="text-slate-500 font-medium text-[16px] mb-5">{user?.email}</p>
          <span className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[13px] font-bold tracking-wide shadow-md inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            Pro Learner Plan
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Learning Statistics Grid */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Learning Overview</h2>
            </div>
            
            {stats ? (
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Documents', value: stats.totalDocuments, color: 'text-[#0091ff]', bg: 'bg-[#0091ff]/5', border: 'border-[#0091ff]/10', icon: '📄' },
                  { label: 'Flashcard Sets', value: stats.totalFlashcardSets, color: 'text-[#9b51e0]', bg: 'bg-[#9b51e0]/5', border: 'border-[#9b51e0]/10', icon: '🃏' },
                  { label: 'Total Quizzes', value: stats.totalQuizzes, color: 'text-[#00c896]', bg: 'bg-[#00c896]/5', border: 'border-[#00c896]/10', icon: '📋' },
                  { label: 'Quizzes Completed', value: stats.completedQuizzes, color: 'text-[#ff7a00]', bg: 'bg-[#ff7a00]/5', border: 'border-[#ff7a00]/10', icon: '✅' },
                ].map(({ label, value, color, bg, border, icon }) => (
                  <div key={label} className={`${bg} ${border} border rounded-[24px] p-6 hover:-translate-y-1 transition-transform duration-300`}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-2xl opacity-80">{icon}</span>
                       <p className={`text-3xl font-black ${color} tracking-tight`}>{value ?? 0}</p>
                    </div>
                    <p className="text-slate-600 font-medium text-[14px] mt-4">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => <div key={i} className="h-[120px] bg-slate-50 rounded-[24px] animate-pulse" />)}
              </div>
            )}
          </div>
        </div>

        {/* Average Score Panel */}
        <div className="md:col-span-1">
          {stats?.avgScore != null ? (
            <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl shadow-slate-900/10 h-full flex flex-col relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
              
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/5 backdrop-blur-md">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              
              <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Average Score</h2>
              <p className="text-slate-400 text-[14px] font-medium mb-auto">Across {stats.completedQuizzes} completed quizzes</p>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-end justify-between mb-4">
                  <span className="text-5xl font-black text-white tracking-tighter">{stats.avgScore}<span className="text-2xl text-emerald-400">%</span></span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out relative"
                    style={{ width: `${stats.avgScore}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full w-full h-1/2" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[32px] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
