import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle,
  Lock,
  Send,
  Sparkles,
} from 'lucide-react';
import { PayrollRun, PayrollItem } from '../types';

interface PayrollProcessingViewProps {
  currentRun: PayrollRun | null;
  items: PayrollItem[];
  onInitializeMonth: (month: string) => Promise<void>;
  onCalculate: () => Promise<void>;
  onApprove: () => Promise<void>;
  onFinalize: () => Promise<void>;
  onPublish: () => Promise<void>;
  isProcessing: boolean;
}

export const PayrollProcessingView: React.FC<PayrollProcessingViewProps> = ({
  currentRun,
  items,
  onInitializeMonth,
  onCalculate,
  onApprove,
  onFinalize,
  onPublish,
  isProcessing,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  const status = currentRun?.status || 'draft';
  const isCalculated = status === 'calculated';
  const isApproved = status === 'approved';
  const isFinalized = status === 'finalized';
  const isPublished = status === 'published';

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Picker */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monthly Payroll Engine</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isPublished
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : isFinalized
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isApproved
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : isCalculated
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute attendance-linked gross calculations, statutory PF/ESI/PT deductions, and immutable payslip snapshots.
          </p>
        </div>

        {/* Action Pipeline Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 font-mono shadow-sm"
          />

          {!currentRun && (
            <button
              onClick={() => onInitializeMonth(selectedMonth)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              <span>Initialize Cycle</span>
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
              {isFinalized && (
                <button
                  onClick={onPublish}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Payslips</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      {currentRun && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
      )}

      {/* Item-wise Breakdown Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Employee Payroll Register ({items.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {isPublished ? 'Status: Published to Mobile Apps' : isFinalized ? 'Status: Locked' : 'Status: Reviewing'}
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
