import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';
import toast from 'react-hot-toast';

export default function GoogleSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { navigate('/login'); return; }
    const authenticate = async () => {
      try {
        localStorage.setItem('cc_token', token);
        const res = await authAPI.getMe();
        login(token, res.data.user);
        toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}!`);
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin/dashboard' : role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard');
      } catch {
        navigate('/login?error=google');
      }
    };
    authenticate();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 spinner" />
        <p className="text-dark-100 animate-pulse">Signing you in with Google...</p>
      </div>
    </div>
  );
}
