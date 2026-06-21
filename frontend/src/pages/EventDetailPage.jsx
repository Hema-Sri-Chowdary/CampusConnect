import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, registrationsAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Clock, Tag, Share2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const qc = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [registering, setRegistering] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['event', id], queryFn: () => eventsAPI.getOne(id).then(r => r.data) });
  const event = data?.data;

  const registerMutation = useMutation({
    mutationFn: () => registrationsAPI.register({ eventId: id }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(['event', id]);
      if (res.data.data?.requiresPayment) {
        navigate('/student/registrations');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed')
  });

  if (isLoading) return (
    <div className="page-container">
      <div className="h-72 bg-dark-800 rounded-3xl animate-pulse mb-8" />
      <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
    </div>
  );

  if (!event) return <div className="page-container text-center py-20"><p className="text-dark-100">Event not found.</p></div>;

  const isFull = event.registeredCount >= event.capacity;
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const canRegister = isAuthenticated && !isFull && !deadlinePassed && event.status === 'published';

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-dark-800 flex items-center justify-center">
        {event.banner ? <img src={event.banner} alt={event.title} className="w-full h-auto max-h-[500px] object-contain" /> : <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-blue-500/20"><span className="text-8xl">🎉</span></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge badge-primary capitalize">{event.category}</span>
            <span className={`badge ${event.mode === 'online' ? 'badge-success' : event.mode === 'hybrid' ? 'badge-info' : 'badge-gray'} capitalize`}>{event.mode}</span>
            {event.feeStructure?.isFree ? <span className="badge badge-success">Free</span> : <span className="badge badge-warning">Paid</span>}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-white">{event.title}</h1>
          <p className="text-primary-300 font-medium mt-1">{event.clubId?.clubName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-display font-bold text-white mb-4">About this Event</h2>
            <p className="text-dark-100 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
          {event.highlights?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">Highlights</h2>
              <ul className="space-y-2">{event.highlights.map((h, i) => <li key={i} className="flex items-start gap-2 text-dark-100"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{h}</li>)}</ul>
            </div>
          )}
          {event.prizes?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">🏆 Prizes</h2>
              <div className="space-y-2">{event.prizes.map((p, i) => <div key={i} className="flex items-center justify-between p-3 bg-amber-500/5 rounded-xl border border-amber-500/20"><span className="text-amber-300 font-semibold">{p.position}</span><span className="text-white">{p.prize}</span></div>)}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration Card */}
          <div className="card p-6">
            {!event.feeStructure?.isFree && (
              <div className="mb-4">
                <p className="text-dark-100 text-xs mb-1">Registration Fee</p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-dark-100">VIT AP Students</p>
                    <p className="text-2xl font-black text-primary-400">₹{event.feeStructure.vitapFee}</p>
                  </div>
                  <div className="flex-1 bg-dark-800/60 border border-dark-700 rounded-xl p-3 text-center">
                    <p className="text-xs text-dark-100">Others</p>
                    <p className="text-2xl font-black text-white">₹{event.feeStructure.externalFee}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Capacity */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-dark-100 mb-1">
                <span>Seats filled</span>
                <span>{event.registeredCount}/{event.capacity}</span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }} />
              </div>
              {isFull && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Event is full</p>}
            </div>

            {canRegister ? (
              <button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending} className="btn btn-primary w-full justify-center btn-lg">
                {registerMutation.isPending ? <div className="w-5 h-5 spinner" /> : '🎟️ Register Now'}
              </button>
            ) : !isAuthenticated ? (
              <button onClick={() => navigate('/login')} className="btn btn-primary w-full justify-center btn-lg">Login to Register</button>
            ) : deadlinePassed ? (
              <div className="text-center py-3 text-red-400 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> Registration closed</div>
            ) : isFull ? (
              <button className="btn btn-secondary w-full justify-center" disabled>Add to Waitlist</button>
            ) : null}
          </div>

          {/* Event Info */}
          <div className="card p-6 space-y-3">
            <h3 className="font-semibold text-white">Event Info</h3>
            <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-primary-400 flex-shrink-0" /><div><p className="text-dark-100 text-xs">Date</p><p className="text-white">{format(new Date(event.date), 'EEEE, dd MMMM yyyy')}</p></div></div>
            <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" /><div><p className="text-dark-100 text-xs">Time</p><p className="text-white">{event.time?.start}{event.time?.end ? ` - ${event.time.end}` : ''}</p></div></div>
            <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" /><div><p className="text-dark-100 text-xs">Venue</p><p className="text-white">{event.venue?.name}</p></div></div>
            <div className="flex items-center gap-3 text-sm"><Users className="w-4 h-4 text-blue-400 flex-shrink-0" /><div><p className="text-dark-100 text-xs">Capacity</p><p className="text-white">{event.capacity} seats</p></div></div>
            {event.registrationDeadline && <div className="flex items-center gap-3 text-sm"><Tag className="w-4 h-4 text-red-400 flex-shrink-0" /><div><p className="text-dark-100 text-xs">Registration Deadline</p><p className="text-white">{format(new Date(event.registrationDeadline), 'dd MMM yyyy')}</p></div></div>}
          </div>

          {/* Contact */}
          {event.contact?.name && (
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-3">Contact</h3>
              <p className="text-white text-sm">{event.contact.name}</p>
              {event.contact.email && <p className="text-dark-100 text-xs">{event.contact.email}</p>}
              {event.contact.phone && <p className="text-dark-100 text-xs">{event.contact.phone}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}