import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export default function ManageClubsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-clubs'], queryFn: () => adminAPI.getAllClubs().then(r => r.data) });
  const approveMutation = useMutation({ mutationFn: adminAPI.approveClub, onSuccess: () => { qc.invalidateQueries(['admin-clubs']); toast.success('Club approved!'); } });
  const clubs = data?.data || [];
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Manage Clubs</h1>
      {isLoading ? <div className="w-10 h-10 spinner mx-auto mt-20" /> : (
        <div className="table-wrapper"><table className="table"><thead><tr><th>Club</th><th>Category</th><th>Coordinator</th><th>Events</th><th>Status</th><th>Actions</th></tr></thead><tbody>{clubs.map(club => (<tr key={club._id}><td><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm">{club.logo ? <img src={club.logo} alt={club.clubName} className="w-full h-full object-cover rounded-lg" /> : '🏆'}</div><span className="font-medium">{club.clubName}</span></div></td><td><span className="badge badge-primary capitalize text-xs">{club.category}</span></td><td className="text-dark-100 text-xs">{club.coordinatorId?.name}</td><td>{club.totalEvents}</td><td><span className={`badge text-xs ${club.isApproved ? 'badge-success' : 'badge-warning'}`}>{club.isApproved ? 'Approved' : 'Pending'}</span></td><td>{!club.isApproved && <button onClick={() => approveMutation.mutate(club._id)} className="btn btn-success btn-sm gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}