import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const CATEGORIES = ['technical', 'coding', 'hackathon', 'workshop', 'cultural', 'sports', 'entrepreneurship', 'ai-ml', 'robotics', 'other'];

export default function EditEventPage() {
  const { id } = useParams(); const navigate = useNavigate(); const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['event', id], queryFn: () => eventsAPI.getOne(id).then(r => r.data) });
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    if (data?.data) {
      const e = data.data;
      reset({ title: e.title, description: e.description, shortDescription: e.shortDescription, category: e.category, mode: e.mode, date: e.date?.split('T')[0], registrationDeadline: e.registrationDeadline?.split('T')[0], capacity: e.capacity, status: e.status, 'venue.name': e.venue?.name, 'time.start': e.time?.start, 'time.end': e.time?.end, 'feeStructure.vitapFee': e.feeStructure?.vitapFee, 'feeStructure.externalFee': e.feeStructure?.externalFee, 'contact.name': e.contact?.name, 'contact.email': e.contact?.email });
    }
  }, [data, reset]);
  const mutation = useMutation({
    mutationFn: (d) => {
      // Convert dot-notation keys to nested objects for proper JSON submission
      const nested = {};
      Object.entries(d).forEach(([key, val]) => {
        const parts = key.split('.');
        if (parts.length === 2) {
          if (!nested[parts[0]]) nested[parts[0]] = {};
          nested[parts[0]][parts[1]] = val;
        } else {
          nested[key] = val;
        }
      });
      return eventsAPI.update(id, nested);
    },
    onSuccess: () => { qc.invalidateQueries(['my-events']); toast.success('Event updated!'); navigate('/coordinator/events'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });
  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Event Details</h2>
          <div><label className="label">Title</label><input {...register('title')} className="input" /></div>
          <div><label className="label">Description</label><textarea {...register('description')} rows={5} className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label><select {...register('category')} className="input py-2">{CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-800 capitalize">{c}</option>)}</select></div>
            <div><label className="label">Mode</label><select {...register('mode')} className="input py-2"><option value="offline" className="bg-dark-800">Offline</option><option value="online" className="bg-dark-800">Online</option><option value="hybrid" className="bg-dark-800">Hybrid</option></select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Date</label><input {...register('date')} type="date" className="input" /></div>
            <div><label className="label">Start Time</label><input {...register('time.start')} type="time" className="input" /></div>
            <div><label className="label">End Time</label><input {...register('time.end')} type="time" className="input" /></div>
          </div>
          <div><label className="label">Venue</label><input {...register('venue.name')} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Capacity</label><input {...register('capacity')} type="number" className="input" /></div>
            <div><label className="label">Registration Deadline</label><input {...register('registrationDeadline')} type="date" className="input" /></div>
          </div>
          <div><label className="label">Status</label><select {...register('status')} className="input py-2"><option value="published" className="bg-dark-800">Published</option><option value="draft" className="bg-dark-800">Draft</option><option value="cancelled" className="bg-dark-800">Cancelled</option><option value="completed" className="bg-dark-800">Completed</option></select></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/coordinator/events')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1 justify-center">{mutation.isPending ? <div className="w-5 h-5 spinner" /> : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
}