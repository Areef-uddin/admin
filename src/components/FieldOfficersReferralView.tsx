import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Share2,
  Copy,
  Check,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  Fingerprint,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { JoiningRequest } from '../types';

interface FieldOfficer {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  is_punched_in: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  location: string;
  total_referrals: number;
  approved_referrals: number;
  pending_referrals: number;
}

export const FieldOfficersReferralView: React.FC = () => {
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [referrals, setReferrals] = useState<JoiningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficerCode, setSelectedOfficerCode] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<JoiningRequest | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [generatorOfficer, setGeneratorOfficer] = useState<string>('SF-FO-101');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [officersRes, requestsRes] = await Promise.all([
        api.getFieldOfficers().catch(() => []),
        api.getJoiningRequests().catch(() => ({ requests: [], counts: { total: 0, pending: 0, approved: 0, rejected: 0 } })),
      ]);

      const defaultOfficers: FieldOfficer[] = [
        {
          id: 90001,
          employee_code: 'SF-FO-101',
          name: 'Rajesh Sharma',
          email: 'rajesh.fo@starforce.com',
          phone: '+91 98765 11001',
          designation: 'Senior Field Officer',
          department: 'Operations & Field Services',
          is_punched_in: true,
          check_in_time: '08:30 AM',
          check_out_time: null,
          location: 'Outer Ring Road HQ, Bangalore',
          total_referrals: 3,
          approved_referrals: 1,
          pending_referrals: 2,
        },
        {
          id: 90002,
          employee_code: 'SF-FO-102',
          name: 'Vikram Singh',
          email: 'vikram.fo@starforce.com',
          phone: '+91 98765 11002',
          designation: 'Area Operations Lead',
          department: 'Operations & Field Services',
          is_punched_in: false,
          check_in_time: null,
          check_out_time: null,
          location: 'Outer Ring Road HQ, Bangalore',
          total_referrals: 2,
          approved_referrals: 1,
          pending_referrals: 1,
        },
        {
          id: 90003,
          employee_code: 'SF-FO-103',
          name: 'Amit Patel',
          email: 'amit.fo@starforce.com',
          phone: '+91 98765 11003',
          designation: 'Site Inspection Officer',
          department: 'Operations & Field Services',
          is_punched_in: true,
          check_in_time: '09:15 AM',
          check_out_time: null,
          location: 'Outer Ring Road HQ, Bangalore',
          total_referrals: 2,
          approved_referrals: 1,
          pending_referrals: 1,
        },
      ];

      setOfficers(officersRes && officersRes.length > 0 ? officersRes : defaultOfficers);
      setReferrals(requestsRes.requests || []);
    } catch (e) {
      console.error('Failed to load field officers data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchToggle = async (code: string) => {
    setActionLoading(code);
    try {
      const res = await api.punchOfficer(code, 'toggle');
      setOfficers((prev) =>
        prev.map((o) => {
          if (o.employee_code === code) {
            return {
              ...o,
              is_punched_in: res.is_punched_in,
              check_in_time: res.check_in_time || o.check_in_time,
              check_out_time: res.check_out_time || o.check_out_time,
            };
          }
          return o;
        })
      );
    } catch (e: any) {
      alert(e.message || 'Failed to update duty status');
    } finally {
      setActionLoading(null);
    }
  };

  const getReferralUrl = (officer: { name: string; employee_code: string; phone?: string }) => {
    // Points directly to the Candidate Registration App on Firebase
    const baseUrl = 'https://starforce-3b4dd.web.app';
    const params = new URLSearchParams({
      ref: officer.name,
      code: officer.employee_code,
    });
    if (officer.phone && officer.phone.trim()) {
      params.set('phone', officer.phone.trim());
    }
    return `${baseUrl}/?${params.toString()}`;
  };

  const handleCopyLink = (officer: { name: string; employee_code: string; phone?: string }) => {
    const url = getReferralUrl(officer);
    navigator.clipboard.writeText(url);
    setCopiedCode(officer.employee_code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleQuickApprove = async (id: number) => {
    if (!confirm('Approve this referred candidate and issue employee onboarding clearance?')) return;
    try {
      await api.approveJoiningRequest(id, {
        official_joining_date: new Date().toISOString().split('T')[0],
        department_id: 1, // Operations
        designation_id: 1,
        salary_wages: 25000,
        background_verification: 'completed',
        police_verification: 'pending',
        documents_verified_by: 'Super Admin',
      });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
  };

  // Filter referrals: strictly require real referral info (officer name or employee code)
  const referredCandidates = referrals.filter((r) => {
    const hasOfficerName = Boolean(r.referred_by_name && r.referred_by_name.trim().length > 0);
    const hasOfficerCode = Boolean(r.referral_employee_code && r.referral_employee_code.trim().length > 0);
    if (!hasOfficerName && !hasOfficerCode) return false;

    if (selectedOfficerCode !== 'all') {
      const matchCode = hasOfficerCode && r.referral_employee_code === selectedOfficerCode;
      const targetOfficer = officers.find((o) => o.employee_code === selectedOfficerCode);
      const matchName = targetOfficer && hasOfficerName && r.referred_by_name!.toLowerCase().includes(targetOfficer.name.toLowerCase());
      if (!matchCode && !matchName) return false;
    }

    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (r.full_name || '').toLowerCase().includes(q);
      const matchPhone = (r.phone || '').toLowerCase().includes(q);
      const matchRefName = (r.referred_by_name || '').toLowerCase().includes(q);
      const matchCode = (r.referral_employee_code || '').toLowerCase().includes(q);
      const matchDesig = (r.proposed_designation || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRefName && !matchCode && !matchDesig) return false;
    }

    return true;
  });

  const totalReferralsCount = referrals.filter((r) => (r.referred_by_name && r.referred_by_name.trim()) || (r.referral_employee_code && r.referral_employee_code.trim())).length;
  const approvedReferralsCount = referrals.filter((r) => ((r.referred_by_name && r.referred_by_name.trim()) || (r.referral_employee_code && r.referral_employee_code.trim())) && r.status === 'approved').length;
  const pendingReferralsCount = referrals.filter((r) => ((r.referred_by_name && r.referred_by_name.trim()) || (r.referral_employee_code && r.referral_employee_code.trim())) && r.status === 'pending').length;
  const activeDutyOfficersCount = officers.filter((o) => o.is_punched_in).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Field Network & Referrals
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Field Officers & Candidate Referral Hub
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Track duty attendance (Punch In / Out), monitor candidate referrals generated by field officers, and distribute shareable registration links with auto-selected officer IDs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Generate Referral Link
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Field Officers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{officers.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {activeDutyOfficersCount} On Duty Now
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Rajesh Sharma, Vikram Singh, Amit Patel</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Candidates Referred</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalReferralsCount}</span>
            <span className="text-xs font-medium text-slate-500">via Officer Links</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Generated by 3 Field Officers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Onboarded & Approved</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{approvedReferralsCount}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {totalReferralsCount > 0 ? Math.round((approvedReferralsCount / totalReferralsCount) * 100) : 0}% Conversion
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Official employee records issued</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Verification Pipeline</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingReferralsCount}</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Pending KYC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting Super Admin approval</p>
        </div>
      </div>

      {/* 3. Field Officers Cards Grid (3 Members) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Field Officers Network (3 Members)</h2>
            <p className="text-xs text-slate-500">Live duty punch status & dedicated candidate registration links</p>
          </div>
          {selectedOfficerCode !== 'all' && (
            <button
              onClick={() => setSelectedOfficerCode('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg transition"
            >
              Reset Filter (Show All Officers)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {officers.map((officer) => {
            const isSelected = selectedOfficerCode === officer.employee_code;
            const isCopied = copiedCode === officer.employee_code;
            const isPunching = actionLoading === officer.employee_code;

            return (
              <div
                key={officer.employee_code}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm p-5 flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top: Avatar & Duty Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                          {officer.name[0]}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            officer.is_punched_in ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{officer.name}</h3>
                        <p className="text-xs font-semibold text-blue-600">{officer.designation}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        officer.is_punched_in
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {officer.is_punched_in ? `On Duty (${officer.check_in_time || 'Present'})` : 'Off Duty'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Employee Code:</span>
                      <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {officer.employee_code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Contact Phone:</span>
                      <span className="font-bold text-slate-800">{officer.phone || '+91 98765 11001'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Assigned Zone:</span>
                      <span className="font-semibold text-slate-700">{officer.location}</span>
                    </div>
                  </div>

                  {/* Referrals Stats Banner */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-blue-50/60 border border-blue-100/80 rounded-xl p-2.5">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Total</div>
                      <div className="text-base font-black text-slate-900">{officer.total_referrals}</div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 font-medium">Approved</div>
                      <div className="text-base font-black text-emerald-600">{officer.approved_referrals}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-600 font-medium">Pending</div>
                      <div className="text-base font-black text-amber-600">{officer.pending_referrals}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyLink(officer)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Link Copied!' : 'Copy Link'}
                    </button>

                    <button
                      onClick={() => setSelectedOfficerCode(isSelected ? 'all' : officer.employee_code)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {isSelected ? 'Viewing Referrals' : 'Filter Referrals'}
                    </button>
                  </div>

                  <button
                    onClick={() => handlePunchToggle(officer.employee_code)}
                    disabled={isPunching}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      officer.is_punched_in
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    {isPunching
                      ? 'Updating...'
                      : officer.is_punched_in
                      ? 'Admin Punch Out'
                      : 'Admin Punch In'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Candidate Referral Pipeline & History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Referred Candidates Pipeline
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {referredCandidates.length} Applications
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Applicants who registered through Field Officer referral links
              </p>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Officer Filter row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, phone, officer name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedOfficerCode}
                onChange={(e) => setSelectedOfficerCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Field Officers</option>
                {officers.map((o) => (
                  <option key={o.employee_code} value={o.employee_code}>
                    {o.name} ({o.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading referred candidates...
          </div>
        ) : referredCandidates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No referred candidates found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'all' || selectedOfficerCode !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Share an officer referral link with applicants to begin receiving candidate registrations.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Applied Role</th>
                  <th className="py-3.5 px-4">Referred By</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referredCandidates.map((candidate) => {
                  const isApproved = candidate.status === 'approved';
                  const isPending = candidate.status === 'pending';

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/80 transition">
                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center">
                            {candidate.full_name ? candidate.full_name[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{candidate.full_name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{candidate.phone}</span>
                              {candidate.aadhaar_number && (
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  UID: {candidate.aadhaar_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {candidate.proposed_designation || 'Field Staff'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {candidate.proposed_department || 'Operations'}
                        </div>
                      </td>

                      {/* Referred By */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {candidate.referred_by_name || 'Field Officer'}
                          </span>
                          {candidate.referral_employee_code && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {candidate.referral_employee_code}
                            </span>
                          )}
                        </div>
                        {candidate.referral_notes && (
                          <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                            {candidate.referral_notes}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {candidate.created_at
                          ? new Date(candidate.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                          {isApproved ? 'Approved' : isPending ? 'Pending KYC' : 'Rejected'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleQuickApprove(candidate.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            View Form
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Generator Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-lg">Generate Candidate Referral Link</h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select a Field Officer to generate their unique shareable link. When applicants open this link on mobile or browser, the registration form opens immediately with this officer's name pre-selected.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Field Officer
              </label>
              <select
                value={generatorOfficer}
                onChange={(e) => setGeneratorOfficer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {officers.map((o) => (
                  <option key={o.employee_code} value={o.employee_code}>
                    {o.name} ({o.employee_code}) - {o.designation}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const selectedOff = officers.find((o) => o.employee_code === generatorOfficer) || officers[0];
              const link = selectedOff ? getReferralUrl(selectedOff) : '';
              const isCopied = copiedCode === 'modal';

              return (
                <div className="space-y-4 pt-2">
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-mono break-all border border-slate-800">
                    {link}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        setCopiedCode('modal');
                        setTimeout(() => setCopiedCode(null), 2500);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}
                    </button>

                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Test Link
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. Candidate Form Preview Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{selectedCandidate.full_name}</h3>
                <p className="text-xs text-slate-500">
                  Application ID #{selectedCandidate.id} • Status: {selectedCandidate.status}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900">
                <span className="font-bold text-blue-700 uppercase tracking-wider text-[10px]">
                  Referral Association
                </span>
                <div className="text-sm font-bold mt-1">
                  Referred by {selectedCandidate.referred_by_name || 'Field Officer'} ({selectedCandidate.referral_employee_code || 'N/A'})
                </div>
                {selectedCandidate.referral_notes && (
                  <p className="text-blue-800 mt-1 italic">{selectedCandidate.referral_notes}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.email || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Proposed Designation:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.proposed_designation || 'Staff'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Proposed Department:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.proposed_department || 'Operations'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Aadhaar Number:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.aadhaar_number || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Branch Location:</span>
                  <div className="font-bold text-slate-800">{selectedCandidate.branch_location || 'Bangalore'}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedCandidate.status === 'pending' && (
                <button
                  onClick={() => {
                    handleQuickApprove(selectedCandidate.id);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Approve Application
                </button>
              )}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
