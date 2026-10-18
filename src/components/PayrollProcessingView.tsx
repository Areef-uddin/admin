import React from 'react';
import {
  Banknote,
  CheckCircle,
  Lock,
  Send,
  Sparkles,
  Trash2,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { PayrollRun, PayrollItem } from '../types';

interface PayrollProcessingViewProps {
  currentRun: PayrollRun | null;
  items: PayrollItem[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onInitializeMonth: (month: string) => Promise<void>;
  onCalculate: () => Promise<void>;
  onApprove: () => Promise<void>;
  onFinalize: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDeleteRun?: (runId: number) => Promise<void>;
  isProcessing: boolean;
}

export const PayrollProcessingView: React.FC<PayrollProcessingViewProps> = ({
  currentRun,
  items,
  selectedMonth,
  onMonthChange,
  onInitializeMonth,
  onCalculate,
  onApprove,
  onFinalize,
  onPublish,
  onDeleteRun,
  isProcessing,
}) => {
  const status = currentRun?.status || 'uninitialized';
  const isCalculated = status === 'calculated';
  const isApproved = status === 'approved';
  const isFinalized = status === 'finalized';
  const isPublished = status === 'published';

  // Format month for display (e.g. "2026-10" -> "October, 2026")
  const formatMonthTitle = (monthStr: string) => {
    try {
      const [y, m] = monthStr.split('-');
      const d = new Date(parseInt(y), parseInt(m) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Picker */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monthly Payroll Engine</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isPublished
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : isFinalized
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isApproved
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : isCalculated
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : currentRun
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {currentRun ? status : 'No Cycle Found'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute attendance-linked calculations, statutory PF/ESI/PT deductions, and immutable payslip snapshots for{' '}
            <strong className="text-slate-700 font-semibold">{formatMonthTitle(selectedMonth)}</strong>.
          </p>
        </div>

        {/* Action Pipeline Buttons & Calendar Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-sm text-slate-800 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          {!currentRun && (
            <button
              onClick={() => onInitializeMonth(selectedMonth)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Initialize & Calculate {selectedMonth}</span>
            </button>
          )}

          {currentRun && (
            <>
              {/* 1. Calculate Engine */}
              {!isFinalized && !isPublished && (
                <button
                  onClick={onCalculate}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isCalculated ? 'Recalculate Run' : 'Calculate Engine'}</span>
                </button>
              )}

              {/* 2. Approve */}
              {isCalculated && (
                <button
                  onClick={onApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Authorize & Approve</span>
                </button>
              )}

              {/* 3. Finalize & Lock */}
              {isApproved && (
                <button
                  onClick={onFinalize}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock & Finalize</span>
                </button>
              )}

              {/* 4. Publish Payslips */}
              {(isFinalized || isApproved) && !isPublished && (
                <button
                  onClick={onPublish}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Payslips</span>
                </button>
              )}

              {/* 5. Delete / Reset Cycle */}
              {onDeleteRun && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete and reset the payroll run for ${selectedMonth}?`)) {
                      onDeleteRun(currentRun.id);
                    }
                  }}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  title="Delete this cycle from database"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Reset Cycle</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Cards or Empty State */}
      {currentRun ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Employees</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{currentRun.total_employees}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active recipients</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Gross Earnings</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{Number(currentRun.total_gross || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Basic + HRA + Allowances</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Deductions</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              -₹{Number(currentRun.total_deductions || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">PF + PT + LOP Deductions</div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 shadow-sm">
            <span className="text-xs text-indigo-700 font-semibold uppercase">Total Net Disbursement</span>
            <div className="text-2xl font-black text-indigo-900 mt-1">
              ₹{Number(currentRun.total_net_pay || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-indigo-600/80 mt-0.5">Bank transfer total</div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Payroll Run Calculated for {formatMonthTitle(selectedMonth)}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Previous test salary records have been completely purged from the database. Use the calendar picker to select any month and generate fresh, verified payroll records.
          </p>
          <button
            onClick={() => onInitializeMonth(selectedMonth)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Banknote className="w-4 h-4" />
            <span>Generate Payroll for {formatMonthTitle(selectedMonth)}</span>
          </button>
        </div>
      )}

      {/* Item-wise Breakdown Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Employee Payroll Register ({items.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {isPublished
              ? 'Status: Published to Mobile Apps'
              : isFinalized
              ? 'Status: Locked'
              : isApproved
              ? 'Status: Approved'
              : currentRun
              ? 'Status: Draft / Reviewing'
              : 'Status: Uninitialized'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-4">Payable Days</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">HRA + Spl</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-6 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div className="text-slate-800 font-semibold">No Payroll Items For This Cycle</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Select a cycle month and click &ldquo;Initialize Cycle&rdquo; to process employee salaries based on verified attendance.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{item.employee?.user?.name || 'Staff Member'}</div>
                      <div className="text-xs text-indigo-600 font-mono font-medium">
                        {item.employee?.employee_code} • {item.employee?.department?.name || 'Operations'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="text-slate-900 font-bold">{item.payable_days}</span>
                      <span className="text-slate-500">/{item.total_days_in_month}d</span>
                      {item.lop_days > 0 && (
                        <span className="text-rose-600 ml-1.5 font-bold">({item.lop_days} LOP)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                      ₹{Number(item.basic_pay).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      ₹{Number(item.hra + item.special_allowance).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                      ₹{Number(item.gross_earnings).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-rose-600 font-semibold">
                      -₹{Number(item.total_deductions).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono text-sm font-black text-emerald-600">
                      ₹{Number(item.net_pay).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
