import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Inbox,
  X,
} from 'lucide-react';
import { LeaveRequest } from '../types';

interface LeavesViewProps {
  leaveRequests: LeaveRequest[];
  onApprove: (id: number, remarks?: string) => Promise<void>;
  onReject: (id: number, remarks?: string) => Promise<void>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaveRequests,
  onApprove,
  onReject,
  onRefresh,
  isRefreshing,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectingItem, setRejectingItem] = useState<LeaveRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState<string>('Rejected per company policy / operational requirements');

  const filtered = leaveRequests.filter((lr) => {
    if (filter === 'all') return true;
    return lr.status === filter;
  });

  const formatLeaveDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = clean.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await onApprove(id, 'Approved by Administrator');
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const id = rejectingItem.id;
    setActionLoading(id);
    try {
      await onReject(id, rejectRemarks || 'Rejected per company policy');
      setRejectingItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all capitalize shadow-sm ${
                filter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50 ml-2 shadow-sm"
              title="Refresh Leave Requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {leaveRequests.length} leave requests
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Leave Type</th>
                <th className="py-3.5 px-6">Date Span</th>
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6">Status & Remarks</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <div className="text-slate-800 font-semibold">No leave requests in &ldquo;{filter}&rdquo; status</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Employees submit leave requests via their mobile application, and pending requests will appear here for management approval.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((lr) => {
                  const isPending = lr.status === 'pending';
                  const isApproved = lr.status === 'approved';
                  const isRejected = lr.status === 'rejected';

                  return (
                    <tr key={lr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{lr.employee?.user?.name || 'Staff Member'}</div>
                        <div className="text-xs text-indigo-600 font-mono font-medium">
                          {lr.employee?.employee_code} • {lr.employee?.department?.name || 'Operations'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {lr.leave_type?.name || 'Casual Leave'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                          <span>{formatLeaveDate(lr.start_date)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{formatLeaveDate(lr.end_date)}</span>
                        </div>
                        {lr.reason && (
                          <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={lr.reason}>
                            &ldquo;{lr.reason}&rdquo;
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {lr.total_days} {Number(lr.total_days) === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isRejected
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                            ></span>
                            <span className="capitalize">{lr.status}</span>
                          </span>

                          {lr.approval_remarks && (
                            <div className="text-[11px] text-slate-500 mt-1 italic">
                              {lr.approval_remarks}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(lr.id)}
                              disabled={actionLoading === lr.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setRejectingItem(lr)}
                              disabled={actionLoading === lr.id}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Remarks Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Leave Request</span>
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600">
                Provide a reason for rejecting the leave requested by{' '}
                <strong className="text-slate-900">{rejectingItem.employee?.user?.name}</strong>:
              </p>

              <textarea
                rows={3}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="w-full mt-3 p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading === rejectingItem.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {actionLoading === rejectingItem.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
