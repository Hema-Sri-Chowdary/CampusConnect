import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { certificatesAPI } from '../api/axios';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Award, Calendar, User } from 'lucide-react';

export default function VerifyCertificatePage() {
  const { code } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-cert', code],
    queryFn: () => certificatesAPI.verify(code).then(r => r.data)
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 spinner" />
    </div>
  );

  if (error || !data?.success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-10 text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Invalid Certificate</h1>
        <p className="text-dark-100">This certificate could not be verified or may have been revoked.</p>
      </div>
    </div>
  );

  const cert = data.data;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <span className="badge badge-success mb-4">✓ Verified Certificate</span>
        <h1 className="text-2xl font-display font-bold text-white mb-6">Certificate Valid</h1>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 p-3 bg-dark-800/60 rounded-xl">
            <User className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <div><p className="text-xs text-dark-100">Participant</p><p className="text-white font-semibold">{cert.userId?.name}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dark-800/60 rounded-xl">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div><p className="text-xs text-dark-100">Event</p><p className="text-white font-semibold">{cert.eventId?.title}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dark-800/60 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div><p className="text-xs text-dark-100">Event Date</p><p className="text-white font-semibold">{cert.eventId?.date && format(new Date(cert.eventId.date), 'dd MMMM yyyy')}</p></div>
          </div>
        </div>
        <p className="text-dark-100 text-xs mt-6">Certificate No: {cert.certificateNumber}</p>
      </div>
    </div>
  );
}
