import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Shield } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('admin@starforce.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-xl p-8 relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/30 mb-3 border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">STARFORCE Core</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Workforce, Attendance & Payroll System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@starforce.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Secure Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Starforce</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            Quick Sign-In Accounts
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@starforce.com')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 border border-slate-200 transition-colors font-medium"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('hr@starforce.com')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 border border-slate-200 transition-colors font-medium"
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('finance@starforce.com')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 border border-slate-200 transition-colors font-medium"
            >
              Finance / Payroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
