import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { registrationsAPI } from '../../api/axios';
import { format } from 'date-fns';
import { Calendar, MapPin, QrCode, Award, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', cls: 'badge-success', icon: CheckCircle },
  pending: { label: 'Pending Payment', cls: 'badge-warning', icon: Hourglass },
  cancelled: { label: 'Cancelled', cls: 'badge-danger', icon: XCircle },
  attended: { label: 'Attended ✓', cls: 'badge-info', icon: CheckCircle },
  waitlisted: { label: 'Waitlisted', cls: 'badge-gray', icon: Hourglass },
};

export default function MyRegistrationsPage() {
  const [qrModal, setQrModal] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationsAPI.getMyRegistrations().then(r => r.data)
  });
  const registrations = data?.data || [];

  if (isLoading) return (
    <div className="space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">My Registrations</h1>
        <p className="text-dark-100 text-sm mt-1">{registrations.length} total registration(s)</p>
      </div>
      {registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map(reg => {
            const evt = reg.eventId;
            const cfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={reg._id} className="card p-5 flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-24 h-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
                  {evt?.banner ? <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📅</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">{evt?.title || 'Unknown Event'}</h3>
                      <span className="text-dark-100 text-xs font-mono">{reg.registrationNumber}</span>
                    </div>
                    <span className={`badge ${cfg.cls} flex-shrink-0`}><Icon className="w-3 h-3" />{cfg.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-dark-100 mt-2">
                    {evt?.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(evt.date), 'dd MMM yyyy')}</span>}
                    {evt?.venue?.name && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{evt.venue.name}</span>}
                    {reg.amountPaid > 0 && <span className="text-emerald-400 font-semibold">₹{reg.amountPaid} paid</span>}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {(reg.status === 'confirmed' || reg.status === 'attended') && (
                      <button onClick={() => setQrModal(reg)} className="btn btn-secondary btn-sm gap-1.5">
                        <QrCode className="w-3.5 h-3.5" /> Show QR
                      </button>
                    )}
                    {reg.certificateGenerated && (
                      <Link to="/student/certificates" className="btn btn-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </Link>
                    )}
                    {evt?._id && <Link to={`/events/${evt._id}`} className="btn btn-secondary btn-sm">View Event</Link>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <span className="text-6xl mb-4 block">📋</span>
          <h2 className="text-xl font-bold text-white mb-2">No registrations yet</h2>
          <p className="text-dark-100 mb-4">Start by exploring and registering for events!</p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      )}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content p-8 text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-display font-bold text-white mb-1">Your Check-In QR</h2>
            <p className="text-dark-100 text-sm mb-4">Show this at the venue for check-in</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-4">
              <QRCodeSVG value={qrModal.qrData || qrModal.registrationNumber} size={180} />
            </div>
            <p className="text-xs text-dark-100 font-mono">{qrModal.registrationNumber}</p>
            <button onClick={() => setQrModal(null)} className="btn btn-secondary mt-4 w-full justify-center">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}