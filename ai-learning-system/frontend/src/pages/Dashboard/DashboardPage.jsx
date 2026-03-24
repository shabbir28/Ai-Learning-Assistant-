import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { 
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  FileText, Brain, Lightbulb, TrendingUp, Target, 
  ChevronRight, Clock, Plus, Upload, 
  Zap, Shield, PlayCircle, Library, BookOpen
} from 'lucide-react';

/* --- DUMMY DATA FOR CHARTS --- */
const weeklyActivityData = [
  { day: 'Mon', hours: 1.5, avg: 1.2 },
  { day: 'Tue', hours: 2.5, avg: 1.2 },
  { day: 'Wed', hours: 1.0, avg: 1.2 },
  { day: 'Thu', hours: 3.0, avg: 1.2 },
  { day: 'Fri', hours: 4.5, avg: 1.2 },
  { day: 'Sat', hours: 2.0, avg: 1.2 },
  { day: 'Sun', hours: 3.5, avg: 1.2 },
];

const subjectTimeData = [
  { subject: 'React', time: 12 },
  { subject: 'Node.js', time: 8 },
  { subject: 'Design', time: 15 },
  { subject: 'Algos', time: 5 },
];

const completionData = [
  { name: 'Completed', value: 75, fill: '#10b981' }, 
];

/* --- MODULAR COMPONENTS --- */

const StatCard = ({ title, value, icon, trend, trendUp, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden group">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-heading rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
          {trend}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
         <p className="text-3xl font-heading font-extrabold text-slate-800 dark:text-white">{value}</p>
         {subtitle && <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{subtitle}</span>}
      </div>
    </div>
  </div>
);

const QuickActionBtn = ({ icon, label, onClick, colorClass }) => (
  <button onClick={onClick} className={`w-full flex sm:flex-col sm:items-center sm:justify-center items-center justify-start gap-4 sm:gap-3 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200 group ${colorClass}`}>
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 group-hover:scale-110 transition-transform duration-300 shadow-inner flex-shrink-0">
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
  </button>
);

const TimelineItem = ({ title, time, type, isLast }) => {
  const getIcon = () => {
    switch(type) {
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'flashcard': return <Lightbulb className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getBg = () => {
    switch(type) {
      case 'document': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50';
      case 'quiz': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50';
      case 'flashcard': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700';
    }
  };

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {!isLast && <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100 dark:bg-slate-700"></div>}
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${getBg()}`}>
        {getIcon()}
      </div>
      <div className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 transition-colors shadow-sm">
        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{title}</p>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    aiService.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || { totalDocuments: 0, totalFlashcardSets: 0, completedQuizzes: 0 };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const aiRecommendations = [
    {
      type: 'continue',
      title: 'Advanced React Patterns',
      icon: <PlayCircle className="w-5 h-5 text-blue-500" />,
      desc: 'You left off at "Compound Components".',
      action: 'Resume',
      onClick: () => navigate('/documents'),
      bg: 'bg-blue-50/50 dark:bg-blue-900/10',
      border: 'border-blue-100 dark:border-blue-900/50',
      text: 'text-blue-700 dark:text-blue-400',
      btnBg: 'bg-white dark:bg-slate-800',
      btnHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
    },
    {
      type: 'recommended',
      title: 'System Design Basics',
      icon: <Library className="w-5 h-5 text-emerald-500" />,
      desc: 'Based on your recent interest in architecture.',
      action: 'Start',
      onClick: () => navigate('/flashcards'),
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      text: 'text-emerald-700 dark:text-emerald-400',
      btnBg: 'bg-white dark:bg-slate-800',
      btnHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
    },
    {
      type: 'weakness',
      title: 'Dynamic Programming',
      icon: <Target className="w-5 h-5 text-orange-500" />,
      desc: 'Your quiz scores here are below average (45%).',
      action: 'Review',
      onClick: () => navigate('/quizzes'),
      bg: 'bg-orange-50/50 dark:bg-orange-900/10',
      border: 'border-orange-100 dark:border-orange-900/50',
      text: 'text-orange-700 dark:text-orange-400',
      btnBg: 'bg-white dark:bg-slate-800',
      btnHover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30'
    }
  ];

  return (
    <div className="w-full mx-auto animate-fade-in pb-12 font-sans transition-colors duration-300">
      
      {/* Header & Gamification Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base font-medium">Ready to conquer your goals today?</p>
        </div>
        
        {/* Gamification Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm font-heading">
             <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Zap className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="currentColor" /></div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Streak</p>
               <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">5 Days</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] font-heading">
             <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" /></div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Level 12</p>
               <div className="flex items-center gap-2">
                 <p className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Pro Learner</p>
                 <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2.4k XP</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Stats & Analytics */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Main KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard 
              title="Documents" 
              value={stats.totalDocuments} 
              icon={<FileText className="w-6 h-6" />} 
              trend="+2" trendUp={true} 
            />
            <StatCard 
              title="Flashcard Sets" 
              value={stats.totalFlashcardSets} 
              icon={<Lightbulb className="w-6 h-6" />} 
              trend="+5" trendUp={true} 
            />
            <StatCard 
              title="Quizzes Taken" 
              value={stats.completedQuizzes} 
              icon={<Target className="w-6 h-6" />} 
              trend="+12%" trendUp={true} 
            />
          </div>

          {/* Analytics Section - Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Weekly Activity Line Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading">Weekly Activity</h3>
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold">Hours</span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyActivityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', fontWeight: 600, color: '#1e293b', backgroundColor: '#fff' }} />
                    <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="avg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time per Subject Bar Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading">Time per Subject</h3>
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold">This Month</span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectTimeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', fontWeight: 600, color: '#1e293b', backgroundColor: '#fff' }} />
                    <Bar dataKey="time" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-emerald-900/30 dark:via-slate-900 dark:to-blue-900/30 rounded-[28px] p-1 shadow-xl shadow-slate-900/10">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-inner">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">AI Learning Path</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Smart suggestions tailored to your progression</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec, i) => (
                  <div key={i} className={`${rec.bg} border ${rec.border} p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300`}>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {rec.icon}
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${rec.text}`}>{rec.type}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1 leading-tight">{rec.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{rec.desc}</p>
                    </div>
                    <button 
                      onClick={rec.onClick}
                      className={`mt-auto w-full py-2.5 ${rec.btnBg} border ${rec.border} ${rec.text} rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all ${rec.btnHover} flex items-center justify-center gap-2 active:scale-95`}
                    >
                      {rec.action} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: Sidebar elements */}
        <div className="space-y-8">
          
          {/* Quick Actions Grid */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-none">
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickActionBtn 
                label="New File" 
                icon={<Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />} 
                colorClass="dark:hover:text-blue-400 hover:text-blue-600" 
                onClick={() => navigate('/documents')}
              />
              <QuickActionBtn 
                label="Gen Cards" 
                icon={<Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} 
                colorClass="dark:hover:text-emerald-400 hover:text-emerald-600" 
                onClick={() => navigate('/documents')}
              />
              <QuickActionBtn 
                label="Take Quiz" 
                icon={<Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />} 
                colorClass="dark:hover:text-purple-400 hover:text-purple-600" 
                onClick={() => navigate('/quizzes')}
              />
              <QuickActionBtn 
                label="Review" 
                icon={<BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />} 
                colorClass="dark:hover:text-orange-400 hover:text-orange-600" 
                onClick={() => navigate('/flashcards')}
              />
            </div>
          </div>

          {/* Goal Progress - Radial Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-none flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading self-start mb-2">Weekly Goal</h3>
            <div className="w-full h-[180px] relative mt-2 text-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={16} data={completionData} startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={15} background={{ fill: 'currentColor', className: 'text-slate-100 dark:text-slate-700' }} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-extrabold text-slate-800 dark:text-white">75%</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Completed</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">You're 2.5 hours away from reaching your target.</p>
          </div>

          {/* Enhanced Activity Timeline */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading">Recent Activity</h3>
              <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">View All</button>
            </div>
            
            <div className="pt-2">
              {data?.recentDocuments?.length ? (
                data.recentDocuments.slice(0, 4).map((doc, idx) => (
                  <TimelineItem 
                    key={doc._id}
                    title={`Opened ${doc.originalName}`}
                    time={formatDate(doc.createdAt)}
                    type="document"
                    isLast={idx === Math.min(data.recentDocuments.length - 1, 3)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No activity yet. Upload a document to set your timeline in motion.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
