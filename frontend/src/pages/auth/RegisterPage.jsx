import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, IdCard, Zap, ArrowRight } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  college: z.string().min(2, 'College name required'),
  studentId: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'coordinator']),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' }
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await authAPI.register(payload);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { userId: res.data.userId, email: data.email, devOtp: res.data.devOtp } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">CampusConnect</span>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account 🚀</h1>
          <p className="text-dark-100 text-sm mb-6">Join thousands of students on CampusConnect</p>

          {/* Role Toggle */}
          <div className="flex bg-dark-800/60 p-1 rounded-xl border border-dark-700 mb-5">
            {[['student', '🎓 Student'], ['coordinator', '🎯 Coordinator']].map(([val, label]) => (
              <label key={val} className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                role === val ? 'bg-primary-500 text-white shadow-glow' : 'text-dark-100 hover:text-white'
              }`}>
                <input type="radio" value={val} {...register('role')} className="hidden" />
                {label}
              </label>
            ))}
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-dark-800/60 border border-dark-700 rounded-xl text-white font-medium text-sm hover:border-primary-500/30 transition-all mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center mb-4">
            <div className="flex-1 border-t border-dark-700" />
            <span className="px-3 text-dark-100 text-xs">or register with email</span>
            <div className="flex-1 border-t border-dark-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('name')} placeholder="" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('phone')} placeholder="" className={`input pl-10 ${errors.phone ? 'input-error' : ''}`} />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input {...register('email')} type="email" placeholder="" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="label">College Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('college')} placeholder="" className={`input pl-10 ${errors.college ? 'input-error' : ''}`} />
                </div>
                {errors.college && <p className="text-red-400 text-xs mt-1">{errors.college.message}</p>}
              </div>
              <div>
                <label className="label">Student ID <span className="text-dark-100">(optional)</span></label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('studentId')} placeholder="" className="input pl-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`} />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg mt-2">
              {loading ? <div className="w-5 h-5 spinner" /> : <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>}
            </button>
          </form>

          <p className="text-center text-dark-100 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
