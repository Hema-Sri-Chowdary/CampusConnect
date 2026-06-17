import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesAPI, registrationsAPI } from '../../api/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Award, Download } from 'lucide-react';

export default function MyCertificatesPage() {
  const qc = useQueryClient();
  const { data: certData, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificatesAPI.getMyCertificates().then(r => r.data)
  });
  const { data: regData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationsAPI.getMyRegistrations().then(r => r.data)
  });

  const generateMutation = useMutation({
    mutationFn: (registrationId) => certificatesAPI.generate(registrationId),
    onSuccess: () => { qc.invalidateQueries(['my-certificates']); qc.invalidateQueries(['my-registrations']); toast.success('Certificate generated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate')
  });

  const certs = certData?.data || [];
  const eligibleRegs = (regData?.data || []).filter(r => (r.status === 'attended' || r.status === 'confirmed') && !r.certificateGenerated);

  const handleDownload = async (cert) => {
    try {
      const res = await certificatesAPI.download(cert._id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `certificate-${cert.certificateNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  if (isLoading) return <div className="w-10 h-10 spinner mx-auto mt-20" />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">My Certificates</h1>
      {eligibleRegs.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3">⚡ Generate Certificates</h2>
          <div className="space-y-2">
            {eligibleRegs.map(reg => (
              <div key={reg._id} className="flex items-center justify-between p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <p className="text-sm text-white">{reg.eventId?.title}</p>
                <button onClick={() => generateMutation.mutate(reg._id)} disabled={generateMutation.isPending}
                  className="btn btn-sm bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20">Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map(cert => (
            <div key={cert._id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{cert.eventId?.title}</h3>
                  <p className="text-xs text-dark-100 font-mono">{cert.certificateNumber}</p>
                  <p className="text-xs text-dark-100">{format(new Date(cert.issuedAt), 'dd MMM yyyy')}</p>
                  <button onClick={() => handleDownload(cert)} className="btn btn-sm gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 mt-3">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card">
          <Award className="w-12 h-12 text-dark-100 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No certificates yet</p>
          <p className="text-dark-100 text-sm">Attend events to earn participation certificates!</p>
        </div>
      )}
    </div>
  );
}