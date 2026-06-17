import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react';

export default function ManageUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['admin-users', search, role, page], queryFn: () => adminAPI.getUsers({ search, role, page, limit: 15 }).then(r => r.data) });
  const toggleMutation = useMutation({ mutationFn: adminAPI.toggleUserActive, onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User status updated.'); } });
  const deleteMutation = useMutation({ mutationFn: adminAPI.deleteUser, onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User deleted.'); } });
  const approveMutation = useMutation({ mutationFn: adminAPI.approveCoordinator, onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Coordinator approved!'); } });
  const users = data?.data || []; const pagination = data?.pagination || {};
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Manage Users</h1>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-10" /></div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input py-2 w-40"><option value="">All Roles</option><option value="student" className="bg-dark-800">Student</option><option value="coordinator" className="bg-dark-800">Coordinator</option><option value="admin" className="bg-dark-800">Admin</option></select>
      </div>
      {isLoading ? <div className="w-10 h-10 spinner mx-auto mt-20" /> : (
        <div className="table-wrapper"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>College</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map(u => (<tr key={u._id}><td className="font-medium">{u.name}</td><td className="text-dark-100 text-xs">{u.email}</td><td><span className={`badge text-xs ${u.role === 'admin' ? 'badge-danger' : u.role === 'coordinator' ? 'badge-primary' : 'badge-info'} capitalize`}>{u.role}</span></td><td className="text-dark-100 text-xs">{u.college}</td><td><div className="flex gap-1"><span className={`badge text-xs ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>{u.role === 'coordinator' && !u.isApproved && <span className="badge badge-gray text-xs">Pending</span>}</div></td><td><div className="flex gap-1.5">{u.role === 'coordinator' && !u.isApproved && <button onClick={() => approveMutation.mutate(u._id)} className="btn btn-success btn-sm">Approve</button>}<button onClick={() => toggleMutation.mutate(u._id)} className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}>{u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}</button>{u.role !== 'admin' && <button onClick={() => { if(window.confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u._id); }} className="btn btn-danger btn-sm"><Trash2 className="w-3.5 h-3.5" /></button>}</div></td></tr>))}</tbody></table></div>
      )}
      {pagination.pages > 1 && (<div className="flex justify-center gap-2 mt-6">{Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (<button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === p ? 'bg-primary-500 text-white shadow-glow' : 'bg-dark-800/60 border border-dark-700 text-dark-100 hover:text-white'}`}>{p}</button>))}</div>)}
    </div>
  );
}