import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../api/axios';
import { useQuery } from '@tanstack/react-query';
import {
  Bell, Menu, X, Sun, Moon, ChevronDown, LogOut,
  User, LayoutDashboard, Zap, Search
} from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'coordinator') return '/coordinator/dashboard';
    return '/student/dashboard';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/events', label: 'Events' },
    { to: '/clubs', label: 'Clubs' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-950/90 backdrop-blur-lg border-b border-dark-700/50 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">CampusConnect</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? 'text-primary-300 bg-primary-500/10' : 'text-dark-100 hover:text-white hover:bg-dark-800/60'
                    }`
                  }>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="btn-icon text-dark-100 hover:text-white hover:bg-dark-800/60">
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button onClick={toggleTheme}
                className="btn-icon text-dark-100 hover:text-white hover:bg-dark-800/60">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link to={`${getDashboardPath().replace('/dashboard', '')}/profile`}
                    className="relative btn-icon text-dark-100 hover:text-white hover:bg-dark-800/60">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-dark-800/60 border border-dark-700/50 hover:border-primary-500/30 transition-all">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary-500/20 flex items-center justify-center">
                        {user?.profilePicture
                          ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                          : <span className="text-primary-300 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
                      </div>
                      <span className="text-sm font-medium hidden sm:block text-white max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className={`w-3 h-3 text-dark-100 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 card border border-dark-700/50 animate-slide-up z-50 py-2">
                        <div className="px-4 py-2 border-b border-dark-700/50 mb-1">
                          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-dark-100 capitalize">{user?.role}</p>
                        </div>
                        <Link to={getDashboardPath()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-100 hover:text-white hover:bg-dark-800/60 transition-all">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={`${getDashboardPath().replace('/dashboard', '')}/profile`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-100 hover:text-white hover:bg-dark-800/60 transition-all">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <div className="border-t border-dark-700/50 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn btn-secondary text-sm">Login</Link>
                  <Link to="/register" className="btn btn-primary text-sm">Join Free</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-icon md:hidden text-dark-100 hover:text-white">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-dark-950/95 backdrop-blur-lg border-t border-dark-700/50 px-4 py-4 space-y-1 animate-slide-up">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-primary-300 bg-primary-500/10' : 'text-dark-100 hover:text-white hover:bg-dark-800/60'
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary flex-1 justify-center">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary flex-1 justify-center">Join Free</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="card p-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search events, clubs..."
                  className="flex-1 bg-transparent text-white placeholder:text-dark-200/50 text-lg outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-dark-100 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
