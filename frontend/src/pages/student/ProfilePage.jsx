import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Phone, Building, IdCard, Camera, Lock, Eye, EyeOff, Trash2, X, LogOut, GraduationCap, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePass, setShowDeletePass] = useState(false);

  const profileFields = [
    user?.name,
    user?.email,
    user?.phone,
    user?.college,
    user?.studentId,
    user?.year,
    user?.branch,
    user?.profilePicture
  ];
  const filledFieldsCount = profileFields.filter(f => f && f !== '').length;
  const fillPercentage = Math.round((filledFieldsCount / profileFields.length) * 100);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, college: user?.college, studentId: user?.studentId, year: user?.year, branch: user?.branch }
  });
  const { register: regPass, handleSubmit: hsPass, reset: resetPass } = useForm();

  const profileMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      return authAPI.updateProfile(fd);
    },
    onSuccess: (res) => { updateUser(res.data.user); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const passMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => { toast.success('Password changed!'); resetPass(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const deleteMutation = useMutation({
    mutationFn: () => authAPI.deleteAccount(user?.isGoogleUser ? {} : { password: deletePassword }),
    onSuccess: () => {
      toast.success('Account deleted. We\'re sorry to see you go.');
      logout();
      navigate('/login');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete account')
  });

  const handleDeleteConfirm = () => {
    if (!user?.isGoogleUser && !deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion.');
      return;
    }
    deleteMutation.mutate();
  };

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>

      {/* Profile Completion Progress */}
      <div className="card p-6 border-primary-500/20 bg-primary-500/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Profile Completion</span>
          <span className="text-sm font-bold text-primary-400">{fillPercentage}%</span>
        </div>
        <div className="w-full bg-dark-800 h-2.5 rounded-full overflow-hidden">
          <div className="bg-primary-500 h-full transition-all duration-500" style={{ width: `${fillPercentage}%` }} />
        </div>
        {fillPercentage < 100 ? (
          <p className="text-xs text-dark-100 mt-2">Fill in all your details and upload a profile picture to complete your profile.</p>
        ) : (
          <p className="text-xs text-emerald-400 mt-2 font-medium">✨ Your profile is 100% complete!</p>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center">
              {avatarPreview || user?.profilePicture
                ? <img src={avatarPreview || user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-4xl font-bold text-primary-300">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{user?.name}</h2>
            <p className="text-dark-100 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge text-xs ${user?.role === 'admin' ? 'badge-danger' : user?.role === 'coordinator' ? 'badge-primary' : 'badge-info'} capitalize`}>{user?.role}</span>
              {user?.isVerified && <span className="badge badge-success text-xs">✓ Verified</span>}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => profileMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('name')} className="input pl-10" /></div></div>
            <div><label className="label">Phone</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('phone')} className="input pl-10" /></div></div>
            <div><label className="label">College</label><div className="relative"><Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('college')} className="input pl-10" /></div></div>
            <div><label className="label">Student ID</label><div className="relative"><IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('studentId')} className="input pl-10" /></div></div>
            <div><label className="label">Year</label><div className="relative"><GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('year')} className="input pl-10" placeholder="e.g. 3rd Year" /></div></div>
            <div><label className="label">Branch</label><div className="relative"><BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...register('branch')} className="input pl-10" placeholder="e.g. CSE" /></div></div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <button type="submit" disabled={profileMutation.isPending} className="btn btn-primary">
              {profileMutation.isPending ? <div className="w-4 h-4 spinner" /> : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      {!user?.isGoogleUser && (
        <div className="card p-6">
          <h2 className="text-lg font-display font-bold text-white mb-4">Change Password</h2>
          <form onSubmit={hsPass(d => passMutation.mutate(d))} className="space-y-4">
            <div><label className="label">Current Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...regPass('currentPassword')} type="password" className="input pl-10" /></div></div>
            <div><label className="label">New Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input {...regPass('newPassword')} type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            <button type="submit" disabled={passMutation.isPending} className="btn btn-secondary">{passMutation.isPending ? <div className="w-4 h-4 spinner" /> : 'Change Password'}</button>
          </form>
        </div>
      )}

      {/* Delete Account */}
      <div className="card p-6 border border-red-500/20 bg-red-500/5">
        <p className="text-dark-300 text-sm mb-4">
          Permanently delete your account and all associated data including registrations, payments, and certificates. <strong className="text-red-400">This action cannot be undone.</strong>
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md card p-6 border border-red-500/30">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Delete Account</h3>
                  <p className="text-dark-100 text-xs">This is permanent and irreversible</p>
                </div>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className="text-dark-100 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-red-800 text-sm leading-relaxed font-semibold">
                Deleting your account will permanently remove:
              </p>
              <ul className="text-red-800/90 text-xs mt-2 space-y-1 list-disc list-inside">
                <li>Your profile and personal information</li>
                <li>All event registrations</li>
                <li>Payment history</li>
                <li>Earned certificates</li>
              </ul>
            </div>

            {/* Password Confirmation (non-Google accounts) */}
            {!user?.isGoogleUser && (
              <div className="mb-4">
                <label className="label">Enter your password to confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                  <input
                    type={showDeletePass ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="input pl-10 pr-10 border-red-500/30 focus:border-red-500/60"
                    onKeyDown={e => e.key === 'Enter' && handleDeleteConfirm()}
                  />
                  <button type="button" onClick={() => setShowDeletePass(!showDeletePass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white">
                    {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                className="flex-1 btn btn-secondary justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending
                  ? <div className="w-4 h-4 spinner border-white/40 border-t-white" />
                  : <><Trash2 className="w-4 h-4" /> Delete Account</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}