import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MapPin,
  CalendarDays,
  BadgePercent,
  Banknote,
  FileText,
  History,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onDutyCount: number;
  pendingJoiningCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onDutyCount,
  pendingJoiningCount = 0,
}) => {
  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'KYC & REGISTRATIONS',
      items: [
        {
          id: 'joining-requests',
          label: 'KYC & Form Registrations',
          icon: UserCheck,
          badge: pendingJoiningCount > 0 ? `${pendingJoiningCount} New` : undefined,
          badgeColor: 'amber',
        },
      ],
    },
    {
      title: 'WORKFORCE MANAGEMENT',
      items: [
        { id: 'employees', label: 'Employees Directory', icon: Users },
        { id: 'attendance', label: 'Attendance Sheet', icon: CalendarCheck },
        {
          id: 'tracking',
          label: 'Live Tracking',
          icon: MapPin,
          badge: onDutyCount > 0 ? `${onDutyCount} Live` : undefined,
          badgeColor: 'emerald',
        },
        { id: 'leaves', label: 'Leave Requests', icon: CalendarDays },
      ],
    },
    {
      title: 'PAYROLL & COMPENSATION',
      items: [
        { id: 'salary-structure', label: 'Salary Structure', icon: BadgePercent },
        { id: 'payroll', label: 'Payroll Processing', icon: Banknote },
        { id: 'payslips', label: 'Payslip Center', icon: FileText },
      ],
    },
    {
      title: 'COMPLIANCE & AUDIT',
      items: [
        { id: 'audit-logs', label: 'Audit Logs', icon: History },
      ],
    },
  ];


  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
      <div>
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-black text-xl tracking-wider">
            Z
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">Zivbiyt</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">HR</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Payroll & Workforce</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navigationSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? 'bg-white'
                            : item.badgeColor === 'amber'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        } animate-pulse`}></span>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{currentUser?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser?.roles?.[0] || 'Super Admin'}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
