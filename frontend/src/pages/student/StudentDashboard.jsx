import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrationsAPI, paymentsAPI } from '../../api/axios';
import { format, isAfter } from 'date-fns';
import { Calendar, CreditCard, Award, ArrowRight, Clock, MapPin, CheckCircle, XCircle, Hourglass } from 'lucide-react';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', cls: 'badge-success' },
  pending: { label: 'Pending Payment', cls: 'badge-warning' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
  attended: { label: 'Attended', cls: 'badge-info' },
  waitlisted: { label: 'Waitlisted', cls: 'badge-gray' },
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: regData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationsAPI.getMyRegistrations().then(r => r.data)
  });

  const { data: payData } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentsAPI.getMyPayments().then(r => r.data)
  });

  const registrations = regData?.data || [];
  const payments = payData?.data || [];
  const upcoming = registrations.filter(r => r.eventId && isAfter(new Date(r.eventId.date), new Date()) && r.status !== 'cancelled');
  const totalSpent = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const stats = [
    { label: 'Registered Events', value: registrations.length, icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Upcoming Events', value: upcoming.length, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Paid', value: `₹${totalSpent}`, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Certificates', value: registrations.filter(r => r.certificateGenerated).length, icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="gradient-primary rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-white/70 text-sm">
            {user?.email?.includes('@vitap') ? 'VIT AP Student' : 'Student'} · {user?.college || 'College not set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} border rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-display font-black text-white">{value}</p>
            <p className="text-dark-100 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white">Upcoming Events</h2>
          <Link to="/student/registrations" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 4).map(reg => {
              const evt = reg.eventId;
              const cfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;
              return (
                <div key={reg._id} className="flex items-center gap-4 p-3 bg-dark-800/40 rounded-xl hover:bg-dark-800/60 transition-colors">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {format(new Date(evt.date), 'dd')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{evt.title}</p>
                    <div className="flex items-center gap-2 text-xs text-dark-100 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(evt.date), 'dd MMM')}</span>
                      {evt.venue?.name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.venue.name}</span>}
                    </div>
                  </div>
                  <span className={`badge ${cfg.cls} text-xs flex-shrink-0`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">📅</span>
            <p className="text-dark-100 text-sm">No upcoming events. <Link to="/events" className="text-primary-400 hover:underline">Browse events</Link></p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white">Recent Payments</h2>
          <Link to="/student/payments" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.slice(0, 3).map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-dark-800/40 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">{p.eventId?.title || 'Event'}</p>
                  <p className="text-dark-100 text-xs">{format(new Date(p.createdAt), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{p.amount}</p>
                  <span className={`badge text-xs ${p.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-dark-100 text-sm py-6">No payment history yet.</p>
        )}
      </div>
    </div>
  );
}
