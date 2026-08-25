'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Booking {
  id: string;
  travelDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  phone?: string;
  user?: { name: string; email: string };
  package?: { name: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900',
  CONFIRMED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
  CANCELLED: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
};

export default function AdminBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // In-project Double Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    bookingId: string;
    action: 'CONFIRMED' | 'CANCELLED';
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'primary';
  }>({
    open: false,
    bookingId: '',
    action: 'CONFIRMED',
    title: '',
    message: '',
    confirmLabel: '',
    variant: 'primary',
  });

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/bookings')
      .then((res) => {
        setBookings(res.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch bookings:', err);
        toast.error('Failed to load bookings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { 
      router.push('/login'); 
      return; 
    }
    if (user?.role === 'ADMIN') {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  // Open Confirm Dialog for Confirmation
  const openConfirmModal = (booking: Booking) => {
    setConfirmDialog({
      open: true,
      bookingId: booking.id,
      action: 'CONFIRMED',
      title: 'Confirm Booking',
      message: `Are you sure you want to confirm this booking for ${booking.user?.name || 'this customer'} (${booking.package?.name || 'Vacation Package'})? The booking status will become CONFIRMED.`,
      confirmLabel: 'Yes, Confirm Booking',
      variant: 'primary',
    });
  };

  // Open Confirm Dialog for Cancellation
  const openCancelModal = (booking: Booking) => {
    setConfirmDialog({
      open: true,
      bookingId: booking.id,
      action: 'CANCELLED',
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel this booking for ${booking.user?.name || 'this customer'} (${booking.package?.name || 'Vacation Package'})? The booking status will be set to CANCELLED and the ${booking.numberOfPeople} seat(s) will be restored to package inventory.`,
      confirmLabel: 'Yes, Cancel Booking',
      variant: 'danger',
    });
  };

  // Execute the confirmed status update via API
  const handleExecuteStatus = async () => {
    const { bookingId, action } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));

    try {
      const res = await api.put(`/api/bookings/${bookingId}`, { status: action });
      toast.success(res.data?.message || `Booking status updated to ${action}`);
      setBookings((prev) => 
        prev.map((b) => b.id === bookingId ? { ...b, status: action } : b)
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">All Bookings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and manage customer travel bookings with double confirmation controls.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-16 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {['User', 'Package', 'Travel Date', 'People', 'Phone', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div>{b.user?.name || 'Unknown User'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{b.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {b.package?.name || 'Vacation Package'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {new Date(b.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold text-center">
                        {b.numberOfPeople}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {b.phone ? (
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{b.phone}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${statusColors[b.status] || 'bg-slate-100 text-slate-800'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Confirm Button (shown for PENDING or CANCELLED bookings) */}
                          {b.status !== 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => openConfirmModal(b)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs transition cursor-pointer"
                              title="Confirm booking"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {/* Cancel Button (shown for PENDING or CONFIRMED bookings) */}
                          {b.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => openCancelModal(b)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md transition cursor-pointer"
                              title="Cancel booking"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* When both are already resolved and not needed */}
                          {b.status === 'CANCELLED' && (
                            <span className="text-[11px] text-slate-400 italic">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No bookings registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-Project Double Confirmation Modal */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel="No, Keep as is"
        variant={confirmDialog.variant}
        onConfirm={handleExecuteStatus}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}

