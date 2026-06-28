import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import GoogleSuccessPage from './pages/auth/GoogleSuccessPage';

// Public Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';
import MyPaymentsPage from './pages/student/MyPaymentsPage';
import MyCertificatesPage from './pages/student/MyCertificatesPage';
import ProfilePage from './pages/student/ProfilePage';
import BookmarkedEventsPage from './pages/student/BookmarkedEventsPage';

// Coordinator Pages
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import ManageEventsPage from './pages/coordinator/ManageEventsPage';
import CreateEventPage from './pages/coordinator/CreateEventPage';
import EditEventPage from './pages/coordinator/EditEventPage';
import EventParticipantsPage from './pages/coordinator/EventParticipantsPage';
import ManageClubPage from './pages/coordinator/ManageClubPage';
import RevenueReportPage from './pages/coordinator/RevenueReportPage';
import CheckInPage from './pages/coordinator/CheckInPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageClubsPage from './pages/admin/ManageClubsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Guards
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 spinner" />
      <p className="text-dark-100 text-sm font-medium animate-pulse">Loading CampusConnect...</p>
    </div>
  </div>
);

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'coordinator') return <Navigate to="/coordinator/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public/External Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-certificate/:code" element={<VerifyCertificatePage />} />
      </Route>

      {/* Protected Main App Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/auth/google/success" element={<GoogleSuccessPage />} />

      {/* Dashboard Redirect */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute roles={['student']}>
          <DashboardLayout role="student" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="registrations" element={<MyRegistrationsPage />} />
        <Route path="payments" element={<MyPaymentsPage />} />
        <Route path="certificates" element={<MyCertificatesPage />} />
        <Route path="bookmarks" element={<BookmarkedEventsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="clubs" element={<ClubsPage />} />
      </Route>

      {/* Coordinator Routes */}
      <Route path="/coordinator" element={
        <ProtectedRoute roles={['coordinator']}>
          <DashboardLayout role="coordinator" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CoordinatorDashboard />} />
        <Route path="events" element={<ManageEventsPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:id/edit" element={<EditEventPage />} />
        <Route path="events/:id/participants" element={<EventParticipantsPage />} />
        <Route path="club" element={<ManageClubPage />} />
        <Route path="revenue" element={<RevenueReportPage />} />
        <Route path="checkin" element={<CheckInPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout role="admin" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="clubs" element={<ManageClubsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
