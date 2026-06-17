import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubsAPI } from '../../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building } from 'lucide-react';

export default function ManageClubPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-club'], queryFn: () => clubsAPI.getMyClub().then(r => r.data) });
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => { if (data?.data) reset({ description: data.data.description, contactEmail: data.data.contactEmail }); }, [data, reset]);
  const mutation = useMutation({
    mutationFn: ({ id, d }) => clubsAPI.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['my-club']); toast.success('Club updated!'); },
    onError: () => toast.error('Update failed')
  });
  if (isLoading) return <div className="w-10 h-10 spinner mx-auto mt-20" />;
  const club = data?.data;
  if (!club) return (
    <div className="text-center py-20 card"><Building className="w-12 h-12 text-dark-100 mx-auto mb-3" /><p className="text-white font-semibold mb-2">No club associated</p><p className="text-dark-100 text-sm">Contact admin to create a club.</p></div>
  );
  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">My Club</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/20 overflow-hidden flex items-center justify-center">{club.logo ? <img src={club.logo} alt={club.clubName} className="w-full h-full object-cover" /> : <span className="text-3xl">🏆</span>}</div>
          <div><h2 className="text-xl font-display font-bold text-white">{club.clubName}</h2><span className="badge badge-primary capitalize text-xs">{club.category}</span><span className={`badge ml-1 text-xs ${club.isApproved ? 'badge-success' : 'badge-warning'}`}>{club.isApproved ? 'Approved' : 'Pending'}</span></div>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate({ id: club._id, d }))} className="space-y-4">
          <div><label className="label">Description</label><textarea {...register('description')} rows={4} className="input resize-none" /></div>
          <div><label className="label">Contact Email</label><input {...register('contactEmail')} type="email" className="input" /></div>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary">{mutation.isPending ? <div className="w-4 h-4 spinner" /> : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}