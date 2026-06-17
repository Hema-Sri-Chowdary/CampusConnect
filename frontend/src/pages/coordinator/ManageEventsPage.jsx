import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../api/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { PlusCircle, Edit2, Trash2, Users, Eye } from 'lucide-react';

export default function ManageEventsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-events'], queryFn: () => eventsAPI.getMyEvents().then(r => r.data) });
  const deleteMutation = useMutation({
    mutationFn: eventsAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['my-events']); toast.success('Event deleted.'); },
    onError: () => toast.error('Delete failed.')
  });
  const events = data?.data || [];
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">My Events</h1>
        <Link to="/coordinator/events/create" className="btn btn-primary gap-2"><PlusCircle className="w-4 h-4" /> Create Event</Link>
      </div>
      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : events.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Event</th><th>Date</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(evt => (
                <tr key={evt._id}>
                  <td><div><p className="font-medium text-white">{evt.title}</p><p className="text-xs text-dark-100 capitalize">{evt.category}</p></div></td>
                  <td className="text-dark-100 text-sm">{format(new Date(evt.date), 'dd MMM yyyy')}</td>
                  <td><div className="flex items-center gap-1 text-sm"><Users className="w-3.5 h-3.5 text-dark-100" /><span className="text-white font-semibold">{evt.registeredCount}</span><span className="text-dark-100">/ {evt.capacity}</span></div></td>
                  <td><span className={`badge text-xs ${evt.status === 'published' ? 'badge-success' : evt.status === 'cancelled' ? 'badge-danger' : 'badge-gray'}`}>{evt.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/events/${evt._id}`} className="btn btn-secondary btn-sm"><Eye className="w-3.5 h-3.5" /></Link>
                      <Link to={`/coordinator/events/${evt._id}/edit`} className="btn btn-secondary btn-sm"><Edit2 className="w-3.5 h-3.5" /></Link>
                      <Link to={`/coordinator/events/${evt._id}/participants`} className="btn btn-secondary btn-sm"><Users className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => { if(window.confirm('Delete this event?')) deleteMutation.mutate(evt._id); }} className="btn btn-danger btn-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 card"><span className="text-5xl mb-4 block">📋</span><p className="text-dark-100 mb-4">No events yet.</p><Link to="/coordinator/events/create" className="btn btn-primary">Create Event</Link></div>
      )}
    </div>
  );
}