import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Eye,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { PayrollItem } from '../types';

interface PayslipsViewProps {
  items: PayrollItem[];
  payrollMonth: string;
}

export const PayslipsView: React.FC<PayslipsViewProps> = ({ items, payrollMonth }) => {
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(items[0] || null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  const openVoucher = (item: PayrollItem) => {
    setSelectedItem(item);
    setIsVoucherOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Employee Payslip Center — {payrollMonth}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Published salary slips accessible to employees via Flutter Mobile App
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          {items.length} Payslips Available
        </span>
      </div>

      {/* Grid of Payslip cards or Empty State */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-14 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-slate-800 font-semibold">No Published Payslips Found</div>
            <p className="text-xs text-slate-500 max-w-sm">
              Salary slips for {payrollMonth} have not been published yet. Run the Monthly Payroll Engine to calculate and publish official payslips.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-slate-200/90 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.employee?.user?.name || 'Staff'}
                    </div>
                    <div className="text-xs text-indigo-600 font-mono font-medium">
                      {item.employee?.employee_code}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {payrollMonth}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Gross Earnings</span>
                    <span className="font-mono text-slate-900 font-semibold">₹{Number(item.gross_earnings).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Deductions (PF, PT, LOP)</span>
                    <span className="font-mono text-rose-600 font-semibold">-₹{Number(item.total_deductions).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-emerald-600">
                    <span>Net Take-Home</span>
                    <span className="font-mono">₹{Number(item.net_pay).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => openVoucher(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Payslip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Corporate Payslip Voucher Modal */}
      {isVoucherOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl rounded-2xl bg-white text-slate-900 shadow-2xl p-8 overflow-y-auto max-h-[95vh] border border-slate-200">
            {/* Top Bar inside modal */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  SF
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">STARFORCE FACILITIES & WORKFORCE MANAGEMENT PVT LTD</h3>
                  <p className="text-xs text-slate-500">Outer Ring Road, Bellandur, Bangalore, Karnataka — 560103</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  title="Print Salary Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVoucherOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voucher Subheader */}
            <div className="py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 block">
                  Confidential Salary Statement
                </span>
                <span className="text-sm font-semibold text-slate-700">Month of {payrollMonth}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved & Finalized</span>
                </span>
              </div>
            </div>

            {/* Employee Meta Details Grid */}
            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Employee Name</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedItem.employee?.user?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Employee Code</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedItem.employee?.employee_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedItem.employee?.department?.name || 'Operations'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Designation</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedItem.employee?.designation?.name || 'Staff'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Days in Month</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedItem.total_days_in_month} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payable Days</span>
                <span className="font-bold text-emerald-600 mt-0.5 block">{selectedItem.payable_days} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">LOP Absences</span>
                <span className="font-bold text-rose-600 mt-0.5 block">{selectedItem.lop_days} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bank A/C</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">•••• 5489</span>
              </div>
            </div>

            {/* Earnings vs Deductions 2-Column Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Earnings column */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
                  <span>Earnings Component</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono font-semibold">₹{Number(selectedItem.basic_pay).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-semibold">₹{Number(selectedItem.hra).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-mono font-semibold">₹{Number(selectedItem.special_allowance).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 border-t border-slate-200 font-bold flex justify-between text-slate-900">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono">₹{Number(selectedItem.gross_earnings).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
                  <span>Deduction Component</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF 12%)</span>
                    <span className="font-mono font-semibold text-rose-600">₹{Number(selectedItem.pf_deduction || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-mono font-semibold text-rose-600">₹{Number(selectedItem.pt_deduction || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Loss of Pay (LOP Deduction)</span>
                    <span className="font-mono font-semibold text-rose-600">₹{Number(selectedItem.lop_deduction).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 border-t border-slate-200 font-bold flex justify-between text-rose-600">
                  <span>Total Deductions</span>
                  <span className="font-mono">₹{Number(selectedItem.total_deductions).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Callout Box */}
            <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                  Net Payable Take-Home Amount
                </span>
                <span className="text-xs text-indigo-700">Credited via Corporate Direct Deposit</span>
              </div>
              <div className="text-2xl font-black text-indigo-700 font-mono">
                ₹{Number(selectedItem.net_pay).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="mt-8 text-center text-[11px] text-slate-400">
              This is a computer-generated official salary slip and requires no physical signature.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
