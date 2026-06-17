import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api/axios';
import { Users, Building, Calendar, CreditCard, TrendingUp, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6C63FF', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats().then(r => r.data) });
  if (isLoading) return <div className="w-10 h-10 spinner mx-auto mt-20" />;
  const stats = data?.data;
  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Students', value: stats?.totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Clubs', value: stats?.totalClubs, icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Events', value: stats?.totalEvents, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Registrations', value: stats?.totalRegistrations, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: CreditCard, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  ];
  const categoryData = (stats?.categoryStats || []).map(c => ({ name: c._id, count: c.count }));
  return (
    <div className="animate-fade-in space-y-6">
      <div className="gradient-primary rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div><div><h1 className="text-2xl font-display font-bold text-white">Admin Dashboard 🛡️</h1><p className="text-white/70 text-sm">Platform overview and management</p></div></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card"><div className={`w-9 h-9 ${bg} border rounded-xl flex items-center justify-center mb-2`}><Icon className={`w-4 h-4 ${color}`} /></div><p className="text-xl font-display font-black text-white">{value ?? '—'}</p><p className="text-dark-100 text-xs mt-0.5">{label}</p></div>
        ))}
      </div>
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Events by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#6C63FF" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Category Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart><Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Recent Users</h2>
        <div className="table-wrapper"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{(stats?.recentUsers || []).map(u => (<tr key={u._id}><td className="font-medium">{u.name}</td><td className="text-dark-100 text-xs">{u.email}</td><td><span className={`badge text-xs ${u.role === 'admin' ? 'badge-danger' : u.role === 'coordinator' ? 'badge-primary' : 'badge-info'} capitalize`}>{u.role}</span></td><td className="text-dark-100 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}