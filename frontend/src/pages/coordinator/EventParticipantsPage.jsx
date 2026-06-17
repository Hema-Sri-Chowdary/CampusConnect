import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, registrationsAPI } from '../../api/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Download, CheckCircle } from 'lucide-react';

export default function EventParticipantsPage() {
  const { id } = useParams(); const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['event-participants', id], queryFn: () => eventsAPI.getParticipants(id).then(r => r.data) });
  const approveMutation = useMutation({
    mutationFn: registrationsAPI.approve,
    onSuccess: () => { qc.invalidateQueries(['event-participants', id]); toast.success('Approved!'); },
    onError: () => toast.error('Failed to approve.')
  });
  const participants = data?.data || [];
  const exportCSV = () => {
    const headers = ['Name','Email','Phone','College','Status','VIT AP','Amount','Reg. No.'];
    const rows = participants.map(r => [r.userId?.name, r.userId?.email, r.userId?.phone, r.userId?.college, r.status, r.isVITAPStudent?'Yes':'No', r.amountPaid, r.registrationNumber]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `participants-${id}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-display font-bold text-white">Participants</h1><p className="text-dark-100 text-sm">{participants.length} registrations</p></div>
        <button onClick={exportCSV} className="btn btn-secondary gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>
      {isLoading ? <div className="w-10 h-10 spinner mx-auto mt-20" /> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>VIT AP</th><th>Amount</th><th>Reg. No.</th><th>Actions</th></tr></thead>
            <tbody>
              {participants.map(reg => (
                <tr key={reg._id}>
                  <td className="font-medium">{reg.userId?.name}</td>
                  <td className="text-dark-100 text-xs">{reg.userId?.email}</td>
                  <td><span className={`badge text-xs ${reg.status === 'confirmed' || reg.status === 'attended' ? 'badge-success' : reg.status === 'pending' ? 'badge-warning' : 'badge-gray'}`}>{reg.status}</span></td>
                  <td><span className={`text-xs font-medium ${reg.isVITAPStudent ? 'text-emerald-400' : 'text-dark-100'}`}>{reg.isVITAPStudent ? 'Yes' : 'No'}</span></td>
                  <td className="font-semibold">{reg.amountPaid > 0 ? `₹${reg.amountPaid}` : 'Free'}</td>
                  <td className="font-mono text-xs text-dark-100">{reg.registrationNumber}</td>
                  <td>{reg.status === 'pending' && <button onClick={() => approveMutation.mutate(reg._id)} className="btn btn-success btn-sm gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}