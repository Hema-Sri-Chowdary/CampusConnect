import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Calendar, CalendarDays, CreditCard, Award, Bookmark,
  User, Building, Building2, BarChart2, Users, Settings, LogOut,
  Menu, X, Zap, Sun, Moon, ChevronRight, Bell, PlusCircle,
  QrCode, FileText, Shield
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/registrations', icon: Calendar, label: 'My Events' },
  { to: '/student/payments', icon: CreditCard, label: 'Payments' },
  { to: '/student/certificates', icon: Award, label: 'Certificates' },
  { to: '/student/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/student/events', icon: CalendarDays, label: 'Browse Events' },
  { to: '/student/clubs', icon: Building2, label: 'Browse Clubs' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

const coordinatorLinks = [
  { to: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/coordinator/events', icon: Calendar, label: 'My Events' },
  { to: '/coordinator/events/create', icon: null, label: 'Create Event' },
  { to: '/coordinator/club', icon: Building, label: 'My Club' },
  { to: '/coordinator/revenue', icon: null, label: 'Revenue' },
  { to: '/coordinator/checkin', icon: null, label: 'Check-In' },
  { to: '/coordinator/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/clubs', icon: Building, label: 'Clubs' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
];

const linksByRole = { student: studentLinks, coordinator: coordinatorLinks, admin: adminLinks };

const roleBadge = { student: 'bg-blue-50 text-blue-600 border border-blue-100', coordinator: 'bg-purple-50 text-purple-600 border border-purple-100', admin: 'bg-red-50 text-red-600 border border-red-100' };

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = linksByRole[role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-white">CampusConnect</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-white font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-white/20 text-white">{role}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to.endsWith('dashboard')}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white bg-white/25 shadow-sm font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all w-full text-left">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-primary-600 to-accent-600 fixed inset-y-0 left-0 z-30 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 inset-y-0 w-64 bg-gradient-to-b from-primary-600 to-accent-600 z-50 shadow-lg">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-sm border-b border-dark-700/50">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <button onClick={() => setSidebarOpen(true)} className="btn-icon lg:hidden text-dark-100 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1 lg:gap-2">
              {role === 'coordinator' && (
                <NavLink to="/coordinator/events/create" className="btn btn-primary btn-sm hidden sm:flex">
                  <PlusCircle className="w-3.5 h-3.5" /> New Event
                </NavLink>
              )}
              {role === 'admin' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-300">Admin</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-56px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
