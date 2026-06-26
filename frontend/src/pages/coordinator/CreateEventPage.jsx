import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, clubsAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';

const CATEGORIES = ['technical', 'coding', 'hackathon', 'workshop', 'cultural', 'sports', 'entrepreneurship', 'ai-ml', 'robotics', 'other'];
const TODAY = new Date().toISOString().split('T')[0];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { mode: 'offline', category: 'technical', status: 'published' } });

  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['my-clubs'],
    queryFn: () => clubsAPI.getMyClub().then(r => r.data)
  });
  const myClubs = clubsData?.data || [];

  useEffect(() => {
    if (myClubs.length === 1) {
      setValue('clubId', myClubs[0]._id);
    }
  }, [myClubs, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      fd.set('feeStructure[isFree]', isFree);
      if (bannerFile) fd.append('image', bannerFile);
      return eventsAPI.create(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['my-events']); toast.success('Event created!'); navigate('/coordinator/events'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create event')
  });

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Event Banner</h2>
          <div className="relative border-2 border-dashed border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-colors cursor-pointer" onClick={() => document.getElementById('banner-input').click()}>
            {bannerPreview ? <img src={bannerPreview} alt="Banner" className="w-full h-auto max-h-64 object-contain mx-auto" />
              : <div className="flex flex-col items-center justify-center h-48 text-dark-100 gap-3"><Upload className="w-10 h-10" /><p className="text-sm">Click to upload event banner</p></div>}
            {bannerPreview && <button type="button" onClick={e => { e.stopPropagation(); setBannerFile(null); setBannerPreview(null); }} className="absolute top-2 right-2 bg-dark-950/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors"><X className="w-4 h-4" /></button>}
          </div>
          <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if(f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); } }} />
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Event Details</h2>
          <div>
            <label className="label">Select Club *</label>
            {clubsLoading ? (
              <p className="text-sm text-dark-100 animate-pulse">Loading clubs...</p>
            ) : (
              <select {...register('clubId', { required: 'Club selection is required' })} className="input py-2">
                <option value="">Choose a club</option>
                {myClubs.map(c => (
                  <option key={c._id} value={c._id}>{c.clubName}</option>
                ))}
              </select>
            )}
            {errors.clubId && <p className="text-red-400 text-xs mt-1">{errors.clubId.message}</p>}
          </div>
          <div><label className="label">Event Title *</label><input {...register('title', { required: 'Title required' })} placeholder="e.g., Code Rush Hackathon 2024" className={`input ${errors.title ? 'input-error' : ''}`} />{errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}</div>
          <div><label className="label">Short Description</label><input {...register('shortDescription')} placeholder="One-line description" className="input" /></div>
          <div><label className="label">Full Description *</label><textarea {...register('description', { required: 'Description required' })} rows={5} placeholder="Describe your event..." className={`input resize-none ${errors.description ? 'input-error' : ''}`} />{errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category *</label><select {...register('category')} className="input py-2">{CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-800 capitalize">{c}</option>)}</select></div>
            <div><label className="label">Event Mode *</label><select {...register('mode')} className="input py-2"><option value="offline" className="bg-dark-800">Offline</option><option value="online" className="bg-dark-800">Online</option><option value="hybrid" className="bg-dark-800">Hybrid</option></select></div>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Date, Time & Venue</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Event Date *</label><input {...register('date', { required: true })} type="date" min={TODAY} className="input" /></div>
            <div><label className="label">Start Time *</label><input {...register('time.start', { required: true })} type="time" className="input" /></div>
            <div><label className="label">End Time</label><input {...register('time.end')} type="time" className="input" /></div>
          </div>
          <div><label className="label">Venue Name *</label><input {...register('venue.name', { required: true })} placeholder="e.g., MBA Seminar Hall" className="input" /></div>
          <div><label className="label">Registration Deadline *</label><input {...register('registrationDeadline', { required: true })} type="date" min={TODAY} className="input" /></div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Capacity & Fees</h2>
          <div><label className="label">Event Capacity *</label><input {...register('capacity', { required: true, min: 1 })} type="number" min="1" placeholder="100" className="input" /></div>
          <div>
            <label className="label">Fee Structure</label>
            <div className="flex gap-3 mb-3">
              {[true, false].map(val => (
                <button key={String(val)} type="button" onClick={() => setIsFree(val)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${isFree === val ? 'bg-primary-500 text-white' : 'bg-dark-800/60 border border-dark-700 text-dark-100'}`}>{val ? '🆓 Free Event' : '💰 Paid Event'}</button>
              ))}
            </div>
            {!isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">VIT AP Fee (₹)</label><input {...register('feeStructure.vitapFee')} type="number" min="0" placeholder="100" className="input" /></div>
                <div><label className="label">External Fee (₹)</label><input {...register('feeStructure.externalFee')} type="number" min="0" placeholder="300" className="input" /></div>
              </div>
            )}
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Contact Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Name</label><input {...register('contact.name')} className="input" /></div>
            <div><label className="label">Email</label><input {...register('contact.email')} type="email" className="input" /></div>
            <div><label className="label">Phone</label><input {...register('contact.phone')} className="input" /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/coordinator/events')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1 justify-center">{mutation.isPending ? <div className="w-5 h-5 spinner" /> : '🚀 Publish Event'}</button>
        </div>
      </form>
    </div>
  );
}