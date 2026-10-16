import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isOnline: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isOnline,
  onRefresh,
  isRefreshing,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-18 px-8 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
          <span className="text-slate-700 font-medium">
            {isOnline ? 'Cloud API Connected' : 'Offline / Reconnecting'}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Date Display */}
        <div className="text-xs text-slate-600 font-medium px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hidden sm:block">
          {currentDate}
        </div>
      </div>
    </header>
  );
};
