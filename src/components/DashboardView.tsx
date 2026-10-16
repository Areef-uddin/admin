import React from 'react';
import {
  Users,
  CalendarCheck,
  MapPin,
  CalendarDays,
  Banknote,
  ArrowUpRight,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { DashboardKPIs } from '../types';

interface DashboardViewProps {
  kpis: DashboardKPIs | null;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ kpis, onNavigate }) => {
  const totalEmployees = kpis?.total_employees ?? 0;
  const presentToday = kpis?.present_today ?? 0;
  const attendanceRate = kpis?.attendance_percentage ?? 0;
  const onDutyField = kpis?.on_duty_field_staff ?? 0;
  const pendingLeaves = kpis?.pending_leaves ?? 0;
  const payroll = kpis?.latest_payroll;

  const statCards = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      subtext: 'Active on MySQL database',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      actionTab: 'employees',
    },
    {
      title: 'Today Attendance',
      value: `${attendanceRate}%`,
      subtext: `${presentToday} of ${totalEmployees} logged in`,
      icon: CalendarCheck,
      color: 'from-emerald-600 to-teal-600',
      actionTab: 'attendance',
    },
    {
      title: 'Active Field Duty',
      value: onDutyField,
      subtext: 'Live GPS pings received',
      icon: MapPin,
      color: 'from-amber-500 to-orange-500',
      actionTab: 'tracking',
      isLive: true,
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves,
      subtext: 'Awaiting manager sign-off',
      icon: CalendarDays,
      color: 'from-purple-600 to-indigo-600',
      actionTab: 'leaves',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-50/60 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              Zivbiyt Payroll & Workforce Core
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Company Operations & Salary Management
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Unified control panel for employee records, GPS field tracking, automated statutory deductions, and monthly payroll finalization.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('payroll')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Banknote className="w-4 h-4" />
              <span>Process Payroll</span>
            </button>
            <button
              onClick={() => onNavigate('tracking')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Live Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.actionTab)}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 p-5 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {card.value}
                    {card.isLive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">{card.subtext}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Payroll Overview & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Summary Card (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monthly Payroll Summary</h3>
                  <p className="text-xs text-slate-500">Current cycle: {kpis?.current_month || '2026-10'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                  payroll?.status === 'finalized' || payroll?.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : payroll?.status === 'calculated'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {payroll?.status || 'Draft Cycle'}
                </span>
              </div>
            </div>

            {/* Financial figures */}
            {payroll ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-medium">Total Gross Earnings</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    ₹{Number(payroll.total_gross).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Basic + HRA + Allowances</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-medium">Statutory Deductions</div>
                  <div className="text-xl font-bold text-rose-600 mt-1">
                    -₹{Number(payroll.total_deductions).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">PF + ESIC + PT + LOP</div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                  <div className="text-xs text-indigo-700 font-semibold">Total Net Payable</div>
                  <div className="text-xl font-black text-indigo-900 mt-1">
                    ₹{Number(payroll.total_net).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-indigo-600/80 mt-1">Company disbursement</div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Payroll Not Yet Computed for {kpis?.current_month || 'Current Cycle'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Click Process Payroll to calculate salary from employee attendance & biometric logs.</div>
                </div>
                <button
                  onClick={() => onNavigate('payroll')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Start Payroll Calculation
                </button>
              </div>
            )}

            {/* Integrity Rules Checklist */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">Automated Calculation Safeguards</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Attendance & LOP proration linked automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statutory PF 12% & State PT ₹200 calculated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bank accounts verified for all active employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Immutable snapshots generated upon finalization</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={() => onNavigate('payroll')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              <span>View full payroll breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Department Distribution (1 col) */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                <h3 className="text-base font-bold text-slate-900">Department Headcount</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{totalEmployees} Total</span>
            </div>

            <div className="mt-4 space-y-3.5">
              {(kpis?.departments && kpis.departments.length > 0) ? (
                kpis.departments.map((dept) => {
                  const pct = totalEmployees > 0 ? Math.round((dept.count / totalEmployees) * 100) : 0;
                  return (
                    <div key={dept.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium truncate max-w-[180px]">{dept.name}</span>
                        <span className="text-slate-600 font-bold">{dept.count} emp</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(8, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">Loading department metrics...</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('employees')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all text-center"
            >
              Manage Employees & Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
