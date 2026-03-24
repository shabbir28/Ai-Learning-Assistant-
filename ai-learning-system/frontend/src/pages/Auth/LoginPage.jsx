import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(form);
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left decorative panel — matches dashboard emerald accent */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-white border-r border-slate-100 flex-col justify-between p-14 relative overflow-hidden">
        {/* Soft background shapes */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-60px] w-96 h-96 bg-[#e8f5f1] rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 text-[17px] tracking-tight">SkillSync AI</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[40px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Learn faster with<br />the power of AI.
            </h2>
            <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-sm">
              Upload your study materials and let AI generate summaries, flashcards, and quizzes — instantly.
            </p>
          </div>

          {/* Feature tiles — matching dashboard card style */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📄', label: 'Upload any PDF', color: 'bg-[#0091ff]', shadow: 'shadow-[#0091ff]/20' },
              { icon: '🤖', label: 'AI Summaries', color: 'bg-[#9b51e0]', shadow: 'shadow-[#9b51e0]/20' },
              { icon: '🃏', label: 'Auto Flashcards', color: 'bg-[#e81cff]', shadow: 'shadow-[#e81cff]/20' },
              { icon: '📝', label: 'Smart Quizzes', color: 'bg-[#00c896]', shadow: 'shadow-[#00c896]/20' },
            ].map((f) => (
              <div key={f.label} className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${f.color} text-white text-lg flex items-center justify-center shadow-lg ${f.shadow} flex-shrink-0`}>
                  {f.icon}
                </div>
                <span className="text-slate-700 font-semibold text-[13px]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat row */}
        <div className="relative z-10 flex items-center gap-8">
          {[['500+', 'Students'], ['10K+', 'Flashcards'], ['95%', 'Pass Rate']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-2xl font-extrabold text-slate-900">{val}</p>
              <p className="text-slate-500 text-sm font-medium">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 animate-fade-in">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">SkillSync AI</span>
          </div>

          <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight mb-1">Welcome back!</h1>
          <p className="text-slate-500 font-medium text-[15px] mb-10">Sign in to continue your learning journey.</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl text-sm font-medium mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 tracking-wide mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3.5 font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-bold text-slate-600 tracking-wide">PASSWORD</label>
                <a href="#" className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3.5 font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
              ) : (
                <> Sign In to SkillSync AI <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-slate-500 font-medium">
              New to SkillSync AI?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
