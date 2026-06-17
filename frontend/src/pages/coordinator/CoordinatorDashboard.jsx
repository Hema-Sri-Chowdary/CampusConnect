import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/axios';
import { format } from 'date-fns';
import { Calendar, Users, Eye, BarChart2, ArrowRight, PlusCircle } from 'lucide-react';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const { data: eventsData } = useQuery({ queryKey: ['my-events'], queryFn: () => eventsAPI.getMyEvents().then(r => r.data) });
  const events = eventsData?.data || [];
  const totalRegistrations = events.reduce((s, e) => s + e.registeredCount, 0);
  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Completed', value: events.filter(e => e.status === 'completed').length, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="gradient-primary rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">Coordinator Dashboard 🎯</h1>
            <p className="text-white/70 text-sm">{user?.name} · Club Coordinator</p>
          </div>
          <Link to="/coordinator/events/create" className="btn bg-white/20 hover:bg-white/30 text-white border-white/20 gap-2"><PlusCircle className="w-4 h-4" /> New Event</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} border rounded-xl flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <p className="text-2xl font-display font-black text-white">{value}</p>
            <p className="text-dark-100 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white">My Events</h2>
          <Link to="/coordinator/events" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">Manage <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 5).map(evt => (
              <div key={evt._id} className="flex items-center gap-4 p-3 bg-dark-800/40 rounded-xl">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{format(new Date(evt.date), 'dd')}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{evt.title}</p>
                  <p className="text-xs text-dark-100">{format(new Date(evt.date), 'dd MMM yyyy')} · {evt.registeredCount}/{evt.capacity} registered</p>
                </div>
                <div className="flex gap-2">
                  <span className={`badge text-xs ${evt.status === 'published' ? 'badge-success' : evt.status === 'completed' ? 'badge-info' : 'badge-gray'}`}>{evt.status}</span>
                  <Link to={`/coordinator/events/${evt._id}/participants`} className="btn btn-secondary btn-sm">Participants</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-dark-100 text-sm">No events yet. <Link to="/coordinator/events/create" className="text-primary-400 hover:underline">Create your first event</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}