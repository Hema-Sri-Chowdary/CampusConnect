import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Mail, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    console.log('onSubmit triggered with data:', data);
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(data);
      console.log('forgotPassword response:', res);
      toast.success(res.data.message || 'OTP sent successfully!');
      // Navigate to reset password page with email in state
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      console.error('forgotPassword error:', err);
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors) => {
    console.log('onSubmit validation failed with errors:', errors);
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

          <h1 className="text-2xl font-display font-bold text-white mb-1">Forgot password? 🔒</h1>
          <p className="text-dark-100 text-sm mb-6">Enter your email and we'll send you an OTP to reset your password.</p>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder=""
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg mt-2">
              {loading ? <div className="w-5 h-5 spinner" /> : <>
                Send OTP <ArrowRight className="w-4 h-4" />
              </>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
