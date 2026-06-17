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
  { to: '/coordinator/events/create', icon: PlusCircle, label: 'Create Event' },
  { to: '/coordinator/club', icon: Building, label: 'My Club' },
  { to: '/coordinator/revenue', icon: BarChart2, label: 'Revenue' },
  { to: '/coordinator/checkin', icon: QrCode, label: 'Check-In' },
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

const roleBadge = { student: 'bg-blue-500/15 text-blue-300', coordinator: 'bg-purple-500/15 text-purple-300', admin: 'bg-red-500/15 text-red-300' };

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = linksByRole[role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-dark-700/50">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg gradient-text">CampusConnect</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-primary-300 font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadge[role]}`}>{role}</span>
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
                  ? 'text-primary-300 bg-primary-500/10 border border-primary-500/20'
                  : 'text-dark-100 hover:text-white hover:bg-dark-800/70'
              }`
            }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-dark-700/50 space-y-1">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-100 hover:text-white hover:bg-dark-800/70 transition-all w-full text-left">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-900/80 backdrop-blur-sm border-r border-dark-700/50 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 inset-y-0 w-64 bg-dark-900 border-r border-dark-700/50 z-50">
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
