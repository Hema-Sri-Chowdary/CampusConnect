import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventsAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export default function CheckInPage() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [lastCheckin, setLastCheckin] = useState(null);
  const { data } = useQuery({ queryKey: ['my-events'], queryFn: () => eventsAPI.getMyEvents().then(r => r.data) });
  const events = data?.data || [];
  const mutation = useMutation({
    mutationFn: ({ eventId, registrationNumber }) => eventsAPI.checkIn(eventId, { registrationNumber }),
    onSuccess: (res) => { toast.success('Check-in successful!'); setLastCheckin(res.data.data); setRegNumber(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Check-in failed')
  });
  const handleCheckIn = () => {
    if (!selectedEvent) { toast.error('Select an event first'); return; }
    if (!regNumber.trim()) { toast.error('Enter registration number'); return; }
    mutation.mutate({ eventId: selectedEvent, registrationNumber: regNumber.trim() });
  };
  return (
    <div className="animate-fade-in max-w-lg space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Event Check-In</h1>
      <div className="card p-6 space-y-4">
        <div><label className="label">Select Event</label><select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="input py-2"><option value="">Choose an event</option>{events.filter(e => e.status === 'published').map(e => <option key={e._id} value={e._id} className="bg-dark-800">{e.title}</option>)}</select></div>
        <div>
          <label className="label">Registration Number</label>
          <div className="flex gap-2">
            <input value={regNumber} onChange={e => setRegNumber(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCheckIn(); }} placeholder="CC-1234567890-ABCDE" className="input flex-1" />
            <button onClick={handleCheckIn} disabled={mutation.isPending} className="btn btn-primary gap-2">{mutation.isPending ? <div className="w-4 h-4 spinner" /> : <><CheckCircle className="w-4 h-4" /> Check In</>}</button>
          </div>
        </div>
      </div>
      {lastCheckin && (
        <div className="card p-6 border-emerald-500/30 animate-slide-up">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-400" /></div><div><p className="font-semibold text-white">Checked In!</p><p className="text-xs text-dark-100">Registration verified</p></div></div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-dark-100">Name</span><span className="text-white font-medium">{lastCheckin.user?.name}</span></div>
            <div className="flex justify-between"><span className="text-dark-100">Reg. No</span><span className="font-mono text-xs text-emerald-400">{lastCheckin.registration?.registrationNumber}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}