import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';

const statConfig = [
  { key: 'totalDocuments',    label: 'TOTAL DOCUMENTS',  icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, bg: 'bg-[#0091ff]', shadow: 'shadow-[#0091ff]/30' },
  { key: 'totalFlashcardSets',label: 'TOTAL FLASHCARDS', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, bg: 'bg-[#e81cff]', shadow: 'shadow-[#e81cff]/30' },
  { key: 'completedQuizzes',  label: 'TOTAL QUIZZES',    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, bg: 'bg-[#00c896]', shadow: 'shadow-[#00c896]/30' },
];

function StatCard({ cfg, value }) {
  const display = value != null ? value : '0';
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="flex flex-col">
        <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">{cfg.label}</p>
        <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{display}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${cfg.bg} text-white flex items-center justify-center shadow-lg ${cfg.shadow}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  
  // Format Date for Recent Activity View
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const secs = d.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in w-full pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-[15px]">Track your learning progress and activity</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-[20px] animate-pulse shadow-sm border border-slate-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statConfig.map((cfg) => (
            <StatCard key={cfg.key} cfg={cfg} value={stats?.[cfg.key]} />
          ))}
        </div>
      )}

      {/* Recent Activity Block */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Recent Activity</h2>
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />)
          ) : data?.recentDocuments?.length ? (
            data.recentDocuments.map((doc) => (
              <div key={doc._id} className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-sm hover:bg-emerald-50/10 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#0091ff] mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-800">
                      Accessed Document: <span className="font-semibold text-slate-600">{doc.originalName}</span>
                    </p>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">
                      {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <Link to={`/documents/${doc._id}`} className="text-[#00c896] font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-4 py-2 hover:bg-[#00c896]/10 rounded-lg">
                  View
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">No recent activity found.</p>
              <Link to="/documents" className="inline-block mt-3 text-emerald-600 font-semibold hover:text-emerald-700">Upload a document to get started</Link>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
