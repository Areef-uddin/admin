import React, { useState } from 'react';
import {
  BadgePercent,
  Calculator,
} from 'lucide-react';

export const SalaryStructureView: React.FC = () => {
  const [simulatedCtc, setSimulatedCtc] = useState<number>(42000);
  const [lopDays, setLopDays] = useState<number>(0);

  // Live Formula Computation
  const basic = Math.round(simulatedCtc * 0.5);
  const hra = Math.round(basic * 0.4);
  const specialAllowance = Math.max(0, Math.round(simulatedCtc - (basic + hra)));
  const gross = basic + hra + specialAllowance;

  // LOP Deduction
  const perDayRate = gross / 30;
  const lopDeduction = Math.round(perDayRate * lopDays);

  // Statutory Deductions
  const pfEmployee = Math.min(1800, Math.round(basic * 0.12));
  const esicEmployee = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  const pt = 200;
  const totalDeductions = lopDeduction + pfEmployee + esicEmployee + pt;
  const netTakeHome = Math.max(0, gross - totalDeductions);

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-indigo-600" />
            <span>Salary Architecture & Statutory Rules</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Starforce salary policy follows effective-dated versioning. CTC is structured across Basic, HRA, statutory EPF (12%), State Professional Tax (₹200), and attendance LOP rules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start md:self-auto shadow-sm">
          <span>Active Policy: STD-M-2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Definitions Card */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Earnings & Statutory Components
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Basic Salary</span>
                <span className="font-semibold text-indigo-600">50% of Monthly CTC</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Core earning component, fully taxable, forms statutory base for PF & gratuity calculations.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-indigo-600">40% of Basic Salary</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Housing assistance allowance, eligible for tax exemption under Sec 10(13A) against valid rent receipts.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Special / Flexi Allowance</span>
                <span className="font-semibold text-indigo-600">Balancing Amount</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Remaining component after Basic and HRA to match total agreed monthly gross CTC.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-700">Provident Fund (EPF Employee)</span>
                <span className="font-semibold text-rose-600">12% of Basic (Max ₹1,800)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Employee mandatory retirement deduction remitted to EPFO with equal employer matching contribution.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-700">Professional Tax (PT)</span>
                <span className="font-semibold text-rose-600">Fixed ₹200 / Month</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">State government statutory levy deducted monthly from gross salary.</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Salary Calculator */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Live Take-Home Simulator</h3>
              </div>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">Realtime Engine</span>
            </div>

            {/* Slider / Controls */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Monthly CTC</span>
                  <span className="text-indigo-600 font-mono text-sm font-bold">₹{simulatedCtc.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={20000}
                  max={120000}
                  step={1000}
                  value={simulatedCtc}
                  onChange={(e) => setSimulatedCtc(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Unpaid Absence (LOP Days)</span>
                  <span className="text-amber-600 font-mono text-sm font-bold">{lopDays} Day{lopDays !== 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={lopDays}
                  onChange={(e) => setLopDays(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Breakdown Receipt */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Basic Salary</span>
                <span className="font-mono text-slate-900 font-semibold">₹{basic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>House Rent Allowance</span>
                <span className="font-mono text-slate-900 font-semibold">₹{hra.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Special Allowance</span>
                <span className="font-mono text-slate-900 font-semibold">₹{specialAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                <span>Gross Monthly Earnings</span>
                <span className="font-mono font-bold">₹{gross.toLocaleString('en-IN')}</span>
              </div>

              {lopDeduction > 0 && (
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>LOP Deduction ({lopDays} days)</span>
                  <span className="font-mono">-₹{lopDeduction.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Provident Fund (12%)</span>
                <span className="font-mono">-₹{pfEmployee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Professional Tax (PT)</span>
                <span className="font-mono">-₹{pt.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-indigo-200 pt-3 mt-2 flex justify-between items-center text-indigo-900 font-black text-base bg-indigo-50/70 p-2.5 rounded-lg border">
                <span>Net Take-Home Salary</span>
                <span className="font-mono text-lg text-indigo-700">₹{netTakeHome.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 text-center">
            Formula matches backend <code className="text-indigo-600 font-semibold">PayrollCalculationService.php</code> exactly.
          </div>
        </div>
      </div>
    </div>
  );
};
