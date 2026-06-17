import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6C63FF', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats().then(r => r.data) });
  if (isLoading) return <div className="w-10 h-10 spinner mx-auto mt-20" />;
  const stats = data?.data;
  const categoryData = (stats?.categoryStats || []).map(c => ({ name: c._id, count: c.count }));
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Analytics Dashboard 📊</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6"><h2 className="font-semibold text-white mb-4">Events by Category</h2><ResponsiveContainer width="100%" height={280}><BarChart data={categoryData}><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} /><Bar dataKey="count" fill="#6C63FF" radius={[6,6,0,0]}>{categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="card p-6"><h2 className="font-semibold text-white mb-4">Category Share</h2><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>{categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} /></PieChart></ResponsiveContainer></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{label:'Students',value:stats?.totalStudents,sub:`of ${stats?.totalUsers} total users`},{label:'Coordinators',value:stats?.totalCoordinators,sub:'active coordinators'},{label:'Avg Reg/Event',value:stats?.totalEvents?Math.round(stats.totalRegistrations/stats.totalEvents):0,sub:'avg registrations per event'}].map(({label,value,sub}) => (
          <div key={label} className="stat-card"><p className="text-3xl font-display font-black text-white">{value ?? 0}</p><p className="text-white font-semibold mt-1">{label}</p><p className="text-dark-100 text-xs mt-0.5">{sub}</p></div>
        ))}
      </div>
    </div>
  );
}