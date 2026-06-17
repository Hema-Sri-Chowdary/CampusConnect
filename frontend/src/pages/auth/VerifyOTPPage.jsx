import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Zap, Mail, RefreshCw } from 'lucide-react';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { userId, email, devOtp } = location.state || {};
  const [otp, setOtp] = useState(() => devOtp ? devOtp.split('') : ['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(600);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((c, i) => { if (i < 6) newOtp[i] = c; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ userId, otp: code });
      login(res.data.token, res.data.user);
      toast.success('Email verified! Welcome to CampusConnect 🎉');
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin/dashboard' : role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success('New OTP sent to your email!');
      setTimer(600);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">CampusConnect</span>
        </div>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Check your email</h1>
          <p className="text-dark-100 text-sm mb-2">We sent a 6-digit OTP to</p>
          <p className="text-primary-300 font-semibold mb-4">{email || 'your email'}</p>

          {/* Dev Mode OTP Banner */}
          {devOtp && (
            <div className="mb-5 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">⚡ Dev Mode — Email not configured</p>
              <p className="text-amber-200 text-sm">Your OTP is: <span className="font-mono font-bold text-lg tracking-[0.2em] text-amber-300">{devOtp}</span></p>
              <p className="text-amber-400/70 text-xs mt-1">This banner only appears when email sending fails (development only)</p>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text" inputMode="numeric"
                maxLength={1} value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold bg-dark-800/60 border-2 rounded-xl text-white transition-all focus:outline-none ${
                  digit ? 'border-primary-500/80 bg-primary-500/10' : 'border-dark-700 focus:border-primary-500/50'
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-dark-100 mb-4">
            {timer > 0 ? (
              <span>Expires in <span className="text-amber-400 font-semibold font-mono">{formatTimer(timer)}</span></span>
            ) : (
              <span className="text-red-400">OTP expired. Please request a new one.</span>
            )}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6}
            className="btn btn-primary w-full justify-center btn-lg mb-3">
            {loading ? <div className="w-5 h-5 spinner" /> : 'Verify Email'}
          </button>

          <button onClick={handleResend} disabled={resending || timer > 540}
            className="flex items-center gap-2 text-sm text-dark-100 hover:text-primary-400 transition-colors mx-auto disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {timer > 540 ? `Resend in ${formatTimer(timer - 540)}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
