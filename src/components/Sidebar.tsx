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
  Shield,
  Sparkles,
  X,
  Share2,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onDutyCount: number;
  pendingJoiningCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onDutyCount,
  pendingJoiningCount = 0,
  isOpen = false,
  onClose,
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
        {
          id: 'field-referrals',
          label: 'Field Officers & Referrals',
          icon: Share2,
          badge: '3 Active',
          badgeColor: 'emerald',
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar (Drawer on mobile, docked on lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#0B132B] border-r border-[#1E293B] flex flex-col justify-between shrink-0 select-none shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Starforce Brand Header */}
          <div className="h-20 px-5 border-b border-[#1E293B] flex items-center justify-between bg-gradient-to-b from-[#0F172A] to-[#0B132B]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white shrink-0 border border-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-wider">STARFORCE</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Workforce & Payroll Core</span>
                </div>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {navigationSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {sec.title}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        onClose?.();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all relative group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                      <span className="tracking-wide">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : item.badgeColor === 'amber'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? 'bg-cyan-300'
                            : item.badgeColor === 'amber'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
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
      <div className="p-3 border-t border-[#1E293B] bg-[#0A0F1E]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-600/30">
              {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-100 truncate">{currentUser?.name || 'Starforce Admin'}</div>
              <div className="text-[10px] text-cyan-400 font-medium truncate">{currentUser?.roles?.[0] || 'Super Administrator'}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out of Starforce Admin"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
