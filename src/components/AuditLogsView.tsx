import React from 'react';
import { History, Shield, User, Globe } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Administrative Audit Trail & Security Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of salary recalculations, approvals, leave grants, and permission events
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
          {logs.length} Events Recorded
        </span>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const timeStr = new Date(log.created_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.action}
                      </span>
                      {log.entity_type && (
                        <span className="text-xs text-slate-500 font-medium">
                          target: {log.entity_type} #{log.entity_id}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {log.description || 'System event triggered'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user?.name || 'Administrator'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{log.ip_address || '127.0.0.1'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono shrink-0 whitespace-nowrap">
                  {timeStr}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
