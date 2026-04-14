import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

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
    to: '/recommendations', label: 'Recommendations',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
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

function Topbar({ toggleDarkMode, isDarkMode, notifications = [], onMarkRead }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const pageName = navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Dashboard';

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <style>{`
        .tb-root {
          height: 72px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid rgba(0,200,150,.12);
          display: flex; align-items: center;
          padding: 0 28px; gap: 16px;
          position: sticky; top: 0; z-index: 40;
          box-shadow: 0 1px 0 rgba(0,200,150,.06), 0 4px 24px rgba(0,0,0,.04);
          transition: background .3s;
        }
        .dark .tb-root {
          background: rgba(15,23,42,0.88);
          border-bottom-color: rgba(0,200,150,.08);
        }

        /* Page title */
        .tb-page { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -.4px; white-space: nowrap; }
        .dark .tb-page { color: #f1f5f9; }
        .tb-page-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg,#00c896,#009e75); flex-shrink: 0; }

        /* Search */
        .tb-search {
          flex: 1; max-width: 420px;
          display: flex; align-items: center; gap: 10px;
          background: #f8fafc; border: 1.5px solid #f0f4f8;
          border-radius: 14px; padding: 0 14px; height: 42px;
          transition: all .22s;
        }
        .tb-search:focus-within {
          background: #fff;
          border-color: #00c896;
          box-shadow: 0 0 0 3px rgba(0,200,150,.1);
        }
        .dark .tb-search { background: rgba(30,41,59,.8); border-color: rgba(255,255,255,.06); }
        .dark .tb-search:focus-within { background: rgba(30,41,59,1); border-color: #00c896; }
        .tb-search input { border: none; outline: none; background: transparent; font-size: 13.5px; font-weight: 500; color: #1e293b; width: 100%; font-family: inherit; }
        .tb-search input::placeholder { color: #94a3b8; }
        .dark .tb-search input { color: #e2e8f0; }
        .tb-search-ico { color: #94a3b8; flex-shrink: 0; transition: color .2s; }
        .tb-search:focus-within .tb-search-ico { color: #00c896; }
        .tb-kbd { padding: 3px 8px; border-radius: 7px; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #94a3b8; white-space: nowrap; }
        .dark .tb-kbd { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); color: #64748b; }

        /* Right side actions */
        .tb-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }

        /* Icon button */
        .tb-icon-btn {
          position: relative; width: 42px; height: 42px;
          border-radius: 12px; border: 1.5px solid #f0f4f8;
          background: #fff; color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s; flex-shrink: 0;
        }
        .tb-icon-btn:hover { background: rgba(0,200,150,.06); border-color: rgba(0,200,150,.2); color: #00c896; }
        .dark .tb-icon-btn { background: rgba(30,41,59,.8); border-color: rgba(255,255,255,.06); color: #94a3b8; }
        .dark .tb-icon-btn:hover { background: rgba(0,200,150,.1); border-color: rgba(0,200,150,.2); color: #00c896; }

        /* Notif badge */
        .tb-badge {
          position: absolute; top: 7px; right: 7px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444; border: 2px solid #fff;
        }
        .dark .tb-badge { border-color: #1e293b; }

        /* Divider */
        .tb-divider { width: 1px; height: 28px; background: #e2e8f0; margin: 0 6px; flex-shrink: 0; }
        .dark .tb-divider { background: rgba(255,255,255,.08); }

        /* User section */
        .tb-user { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 10px 6px 6px; border-radius: 14px; border: 1.5px solid transparent; transition: all .2s; }
        .tb-user:hover { background: rgba(0,200,150,.05); border-color: rgba(0,200,150,.15); }
        .dark .tb-user:hover { background: rgba(0,200,150,.08); }
        .tb-avatar {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg,#00c896,#007a5e);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #fff;
          box-shadow: 0 4px 10px rgba(0,200,150,.3);
        }
        .tb-user-name { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .tb-user-email { font-size: 11px; font-weight: 500; color: #94a3b8; margin-top: 1px; }
        .dark .tb-user-name { color: #f1f5f9; }
        .tb-online { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; position: absolute; bottom: -1px; right: -1px; }
        .dark .tb-online { border-color: #1e293b; }

        /* Notif dropdown */
        @keyframes tbNotifIn { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
        .tb-notif-drop {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 320px; background: #fff; border-radius: 18px;
          border: 1.5px solid #f0f4f8;
          box-shadow: 0 16px 48px rgba(0,0,0,.14);
          overflow: hidden; z-index: 50;
          animation: tbNotifIn .22s cubic-bezier(.16,1,.3,1);
        }
        .dark .tb-notif-drop { background: #1e293b; border-color: rgba(255,255,255,.06); }
        .tb-notif-head { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .dark .tb-notif-head { border-bottom-color: rgba(255,255,255,.06); }
        .tb-notif-title { font-size: 14px; font-weight: 800; color: #0f172a; }
        .dark .tb-notif-title { color: #f1f5f9; }
        .tb-notif-badge { background: rgba(0,200,150,.12); color: #00a87d; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 99px; }
        .tb-notif-item { padding: 13px 18px; border-bottom: 1px solid #f8fafc; display: flex; align-items: flex-start; gap: 10px; transition: background .15s; cursor: pointer; }
        .dark .tb-notif-item { border-bottom-color: rgba(255,255,255,.04); }
        .tb-notif-item:hover { background: #f8fafc; }
        .dark .tb-notif-item:hover { background: rgba(255,255,255,.04); }
        .tb-notif-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .tb-notif-ititle { font-size: 13px; font-weight: 700; color: #1e293b; }
        .dark .tb-notif-ititle { color: #e2e8f0; }
        .tb-notif-idesc { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .dark .tb-notif-idesc { color: #64748b; }
        .tb-notif-time { font-size: 11px; color: #9ca3af; margin-top: 3px; }
        .tb-notif-foot { padding: 12px 18px; text-align: center; background: #f8fafc; }
        .dark .tb-notif-foot { background: rgba(255,255,255,.03); }
        .tb-notif-all { font-size: 13px; font-weight: 700; color: #00c896; border: none; background: transparent; cursor: pointer; font-family: inherit; transition: color .15s; }
        .tb-notif-all:hover { color: #009e75; }
      `}</style>

      <header className="tb-root">
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div className="tb-page-dot" />
          <span className="tb-page">{pageName}</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="tb-search" style={{ flexShrink: 1 }}>
          <svg className="tb-search-ico" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search documents, flashcards..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
          <span className="tb-kbd hidden xl:inline">↵</span>
        </form>

        {/* Right actions */}
        <div className="tb-right">
          {/* Dark mode */}
          <button className="tb-icon-btn" onClick={toggleDarkMode} title={isDarkMode ? 'Light mode' : 'Dark mode'}>
            {isDarkMode ? (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="tb-icon-btn" onClick={() => setShowNotifications(s => !s)} title="Notifications">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && <span className="tb-badge" />}
            </button>

            {showNotifications && (
              <div className="tb-notif-drop">
                <div className="tb-notif-head">
                  <span className="tb-notif-title">Notifications</span>
                  {unreadCount > 0 && <span className="tb-notif-badge">{unreadCount} new</span>}
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm font-medium text-slate-500">No new notifications</div>
                  ) : notifications.map(n => (
                    <div key={n._id} onClick={() => { if(n.unread) onMarkRead(n._id) }} className="tb-notif-item" style={{ background: n.unread ? 'rgba(0,200,150,.03)' : undefined }}>
                      <div className="tb-notif-dot" style={{ background: n.unread ? '#00c896' : '#e2e8f0' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tb-notif-ititle">{n.title}</div>
                        <div className="tb-notif-idesc">{n.desc}</div>
                        <div className="tb-notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tb-notif-foot">
                  <button className="tb-notif-all" onClick={() => onMarkRead()}>Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          <div className="tb-divider" />

          {/* User */}
          <div className="tb-user">
            <div style={{ position: 'relative' }}>
              <div className="tb-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <div className="tb-online" />
            </div>
            <div className="hidden sm:block">
              <div className="tb-user-name">{user?.name || 'User'}</div>
              <div className="tb-user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileNotif, setShowMobileNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await notificationService.getNotifications(token);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkRead = async (id = null) => {
    if (!token) return;
    try {
      await notificationService.markAsRead(token, id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

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
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Desktop Topbar */}
        <div className="hidden md:block w-full">
          <Topbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} notifications={notifications} onMarkRead={handleMarkRead} />
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
                    {notifications.filter(n => n.unread).length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>}
                 </button>
                 {/* Mobile Notifications Dropdown overlay */}
                 {showMobileNotif && (
                    <div className="absolute right-0 top-12 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        <button className="text-xs text-emerald-600 font-medium" onClick={() => handleMarkRead()}>Mark all read</button>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                        ) : notifications.map(n => (
                          <div key={n._id} onClick={() => { if(n.unread) handleMarkRead(n._id) }} className={`p-3 border-b border-slate-50 ${n.unread ? 'bg-emerald-50/50' : ''}`}>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent w-full p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
