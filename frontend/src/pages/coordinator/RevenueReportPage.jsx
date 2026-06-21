import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../../api/axios';
import { format } from 'date-fns';

export default function RevenueReportPage() {
  const { data } = useQuery({ queryKey: ['my-events'], queryFn: () => eventsAPI.getMyEvents().then(r => r.data) });
  const events = data?.data || [];
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Revenue Report</h1>
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Event Revenue Summary</h2>
        {events.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Event</th><th>Date</th><th>Registrations</th><th>VIT AP Fee</th><th>External Fee</th></tr></thead>
              <tbody>{events.map(e => (
                <tr key={e._id}>
                  <td className="font-medium">{e.title}</td>
                  <td className="text-dark-100 text-sm">{format(new Date(e.date), 'dd MMM yyyy')}</td>
                  <td>{e.registeredCount}/{e.capacity}</td>
                  <td>{e.feeStructure?.isFree ? 'Free' : `₹${e.feeStructure?.vitapFee}`}</td>
                  <td>{e.feeStructure?.isFree ? 'Free' : `₹${e.feeStructure?.externalFee}`}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="text-dark-100 text-sm">No events to report yet.</p>}
      </div>
    </div>
  );
}