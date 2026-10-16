import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Inbox,
  RotateCcw,
} from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AttendanceViewProps {
  records: AttendanceRecord[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  records,
  currentDate,
  onDateChange,
  onRefresh,
  isRefreshing,
}) => {
  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const checkedOutCount = records.filter((r) => !!r.check_out_at).length;

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const formattedDisplayDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Date Navigator & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Selector with Next / Prev / Today Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-sm">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative mx-1">
              <Calendar className="w-4 h-4 text-indigo-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-8 pr-2 py-1 bg-transparent text-sm text-slate-800 focus:outline-none font-medium cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-indigo-600 font-semibold shadow-sm transition-colors"
          >
            Today
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50 shadow-sm"
              title="Refresh Attendance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          <span className="text-xs text-slate-500 ml-2 hidden md:inline font-medium">
            {formattedDisplayDate}
          </span>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{presentCount} Present</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{lateCount} Late</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>{checkedOutCount} Checked Out</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Shift</th>
                <th className="py-3.5 px-6">Check-In</th>
                <th className="py-3.5 px-6">Check-Out</th>
                <th className="py-3.5 px-6">Total Hours</th>
                <th className="py-3.5 px-6">Status & Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <div className="text-slate-800 font-semibold">No attendance records for {formattedDisplayDate}</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Employees have not logged check-in entries for this date. You can select another date or view active tracking.
                      </p>
                      <button
                        onClick={handleToday}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Jump to Today
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const checkInTime = rec.check_in_at
                    ? new Date(rec.check_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const checkOutTime = rec.check_out_at
                    ? new Date(rec.check_out_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : 'On Duty';

                  const isCheckedIn = !!rec.check_in_at;
                  const isCheckedOut = !!rec.check_out_at;

                  let effectiveMinutes = rec.total_minutes || 0;
                  if (isCheckedIn && (effectiveMinutes === 0 || !isCheckedOut)) {
                    const inMs = rec.check_in_at ? new Date(rec.check_in_at).getTime() : Date.now();
                    const outMs = (isCheckedOut && rec.check_out_at) ? new Date(rec.check_out_at).getTime() : Date.now();
                    effectiveMinutes = Math.max(0, Math.floor((outMs - inMs) / 60000));
                  }

                  const hours = Math.floor(effectiveMinutes / 60);
                  const mins = effectiveMinutes % 60;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{rec.employee?.user?.name || 'Staff Member'}</div>
                        <div className="text-xs text-indigo-600 font-mono font-medium">
                          {rec.employee?.employee_code} • {rec.employee?.department?.name || 'Field Services'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-xs text-slate-800 font-medium">{rec.shift?.name || 'Field Morning Shift'}</div>
                        <div className="text-[11px] text-slate-500">08:30 - 17:30</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono text-xs font-semibold text-slate-900">{checkInTime}</span>
                        </div>
                        {rec.check_in_address && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.check_in_address}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span className={`font-mono text-xs font-semibold ${isCheckedOut ? 'text-slate-900' : 'text-emerald-600 flex items-center gap-1.5'}`}>
                            {!isCheckedOut && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            <span>{checkOutTime}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isCheckedIn ? (
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>
                                {effectiveMinutes > 0 ? `${hours}h ${mins}m` : '< 1m'}
                              </span>
                              {!isCheckedOut && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Live
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {effectiveMinutes >= 480 ? 'Full Shift (8h+)' : 'In Progress'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Absent / Off</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span className="capitalize">{rec.status}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
