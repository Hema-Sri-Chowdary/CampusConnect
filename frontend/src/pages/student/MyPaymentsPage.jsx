import { useQuery } from '@tanstack/react-query';
import { paymentsAPI } from '../../api/axios';
import { format } from 'date-fns';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

export default function MyPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentsAPI.getMyPayments().then(r => r.data)
  });
  const payments = data?.data || [];
  const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  if (isLoading) return <div className="w-10 h-10 spinner mx-auto mt-20" />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Payment History</h1>
        <p className="text-dark-100 text-sm mt-1">Total spent: <span className="text-emerald-400 font-semibold">₹{total}</span></p>
      </div>
      {payments.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Event</th><th>Amount</th><th>Payment ID</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td className="font-medium">{p.eventId?.title || '—'}</td>
                  <td className="font-bold text-white">₹{p.amount}</td>
                  <td className="font-mono text-xs text-dark-100 max-w-[120px] truncate">{p.razorpayPaymentId || p.razorpayOrderId}</td>
                  <td className="text-dark-100 text-xs">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                  <td>
                    <span className={`badge text-xs ${p.status === 'paid' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 card">
          <CreditCard className="w-12 h-12 text-dark-100 mx-auto mb-3" />
          <p className="text-dark-100">No payments yet</p>
        </div>
      )}
    </div>
  );
}