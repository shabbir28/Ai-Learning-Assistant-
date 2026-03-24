import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  },
  {
    to: '/documents', label: 'Documents',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    to: '/flashcards', label: 'Flashcards',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    to: '/quizzes', label: 'Quizzes',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
];

function Sidebar({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full w-[280px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-r border-white/40 dark:border-slate-800/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-colors duration-300">
      {/* Logo Area */}
      <div className="flex items-center gap-4 px-8 py-8 h-24">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform transition-transform hover:scale-105">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p className="font-black text-slate-800 dark:text-white text-[17px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">SkillSync AI</p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Assistant</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to} to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-none'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                )}
                <span className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white dark:bg-emerald-900/40 shadow-sm text-emerald-600 dark:text-emerald-400' : 'bg-transparent text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:bg-white/50 dark:group-hover:bg-slate-700/50'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>



      {/* Logout button */}
      <div className="p-4 mt-auto border-t border-slate-100/50 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
        >
          <span className="p-2 rounded-xl transition-all duration-300 bg-transparent group-hover:bg-red-100/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar({ toggleDarkMode, isDarkMode }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside click for notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };
  
  const dummyNotifications = [
    { id: 1, title: 'Document processed', desc: 'Your document "react_basics.pdf" is ready.', time: '2m ago', unread: true },
    { id: 2, title: 'Quiz generated', desc: 'A new 10-question quiz was created.', time: '1h ago', unread: true },
    { id: 3, title: 'Welcome!', desc: 'Welcome to AI Learning Assistant.', time: '1d ago', unread: false },
  ];

  return (
    <header className="h-[88px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white/40 dark:border-slate-800/50 flex items-center justify-between px-8 flex-shrink-0 z-20 sticky top-0 shadow-[0_4px_32px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="flex-1 flex items-center">
        {/* Search Bar Placeholder (Premium Touch) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center w-full max-w-md bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 shadow-sm shadow-slate-100/50 dark:shadow-none hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-all group focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 dark:focus-within:border-emerald-700">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search documents, flashcards..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="hidden xl:inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600">↵</kbd>
          </div>
        </form>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="relative p-2.5 bg-white dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-100/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-100/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Notifications</h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">2 new</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {dummyNotifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>
                ) : (
                  dummyNotifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${n.unread ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.unread ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                        <div>
                          <p className={`text-sm ${n.unread ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-700 dark:text-slate-400'}`}>{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.desc}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50 text-center">
                <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">View All</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="w-px h-8 bg-slate-200/60 dark:bg-slate-700 hidden sm:block"></div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3.5 pl-2 cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user?.name || 'User'}</p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-emerald-500/20 flex-shrink-0 border-2 border-white dark:border-slate-800 transform transition-transform group-hover:scale-105">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileNotif, setShowMobileNotif] = useState(false);
  
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const dummyNotifications = [
    { id: 1, title: 'Document processed', desc: 'Your document "react_basics.pdf" is ready.', time: '2m ago', unread: true },
    { id: 2, title: 'Quiz generated', desc: 'A new 10-question quiz was created.', time: '1h ago', unread: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-900 transition-colors duration-300">
      {/* Decorator blobs for background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden md:block">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-3xl opacity-60"></div>
        <div className="absolute top-[60%] -left-[10%] w-[30%] h-[40%] rounded-full bg-blue-100/40 dark:bg-blue-900/20 blur-3xl opacity-50"></div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 z-30">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px] shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        {/* Desktop Topbar */}
        <div className="hidden md:block w-full">
          <Topbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        </div>
        
        {/* Mobile topbar */}
        <div className="md:hidden flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/40 dark:border-slate-700/50 z-20 sticky top-0 shadow-sm relative transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
               <button onClick={() => setMobileOpen(true)} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
              </div>
              <span className="font-black tracking-tight text-slate-800 dark:text-white text-[15px]">SkillSync AI</span>
            </div>
            <div className="flex items-center gap-2">
               {/* Mobile Dark Mode Toggle */}
               <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                 {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                 ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                 )}
               </button>
               <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </button>
               <div className="relative">
                 <button onClick={() => setShowMobileNotif(!showMobileNotif)} className="relative p-2 bg-white rounded-full text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                 </button>
                 {/* Mobile Notifications Dropdown overlay */}
                 {showMobileNotif && (
                    <div className="absolute right-0 top-12 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        {dummyNotifications.map(n => (
                          <div key={n.id} className="p-3 border-b border-slate-50">
                            <p className="text-sm font-bold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                 )}
               </div>
               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20 ml-1">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
               </div>
            </div>
          </div>
          {/* Mobile Search Bar Expansion */}
          {isMobileSearchOpen && (
            <div className="px-4 pb-3 pt-1 animate-fade-in">
              <form onSubmit={handleMobileSearchSubmit} className="flex flex-row items-center w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full ml-2 text-sm text-slate-800 placeholder-slate-400"
                />
              </form>
            </div>
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative z-10 w-full p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto min-h-full animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
