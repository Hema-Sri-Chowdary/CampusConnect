import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Hash, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialEmail = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail
    }
  });

  const onSubmit = async (data) => {
    console.log('onSubmit triggered with data:', data);
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword
      });
      console.log('resetPassword response:', res);
      toast.success(res.data.message || 'Password reset successful!');
      navigate('/login');
    } catch (err) {
      console.error('resetPassword error:', err);
      toast.error(err.response?.data?.message || 'Failed to reset password. Please verify the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">CampusConnect</span>
        </div>

        <div className="card p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-dark-100 hover:text-white text-sm mb-5 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>

          <h1 className="text-2xl font-display font-bold text-white mb-1">Reset Password</h1>
          <p className="text-dark-100 text-sm mb-6">Enter the OTP code received in your email and choose a new password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder=""
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  disabled={!!initialEmail}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">OTP Code</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input
                  {...register('otp')}
                  type="text"
                  placeholder=""
                  maxLength={6}
                  className={`input pl-10 tracking-[0.25em] font-mono ${errors.otp ? 'input-error' : ''}`}
                />
              </div>
              {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>}
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input
                  {...register('newPassword')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg mt-2">
              {loading ? <div className="w-5 h-5 spinner" /> : <>
                Reset Password <ArrowRight className="w-4 h-4" />
              </>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
