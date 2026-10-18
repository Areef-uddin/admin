import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  CreditCard,
  Briefcase,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  X,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Download,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { JoiningRequest, JoiningRequestCounts } from '../types';

interface JoiningRequestsViewProps {
  onUpdated?: () => void;
}

export const JoiningRequestsView: React.FC<JoiningRequestsViewProps> = ({ onUpdated }) => {
  const [requests, setRequests] = useState<JoiningRequest[]>([]);
  const [counts, setCounts] = useState<JoiningRequestCounts>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<JoiningRequest | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; file_name: string; file_url: string; mime_type?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kyc_vault'>('table');

  const resolveFileUrl = (url?: string) => {
    if (!url) return '';
    // If it's a data URI (base64 image/document), return as-is
    if (url.startsWith('data:')) return url;

    // Fix insecure HTTP URLs on production HTTPS domain to avoid Mixed Content block
    if (url.startsWith('http://backend-gi0y.onrender.com')) {
      url = url.replace('http://', 'https://');
    }

    // Rewrite localhost URLs to Render when viewing from hosted production
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const path = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
        if (path.includes('/storage/joining_docs/')) {
          const filename = path.split('/storage/joining_docs/')[1];
          return `https://backend-gi0y.onrender.com/api/v1/joining/documents/${filename}`;
        }
        return `https://backend-gi0y.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
      }
      return url;
    }

    // If it's a Render storage URL, prefer the resilient streaming endpoint
    if (url.includes('backend-gi0y.onrender.com/storage/joining_docs/')) {
      const filename = url.split('/storage/joining_docs/')[1];
      return `https://backend-gi0y.onrender.com/api/v1/joining/documents/${filename}`;
    }

    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');

    // Relative URLs
    const base = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://127.0.0.1:8000'
      : 'https://backend-gi0y.onrender.com';

    // If it's a relative /storage/joining_docs path, route to streaming endpoint
    if (url.includes('joining_docs/')) {
      const filename = url.split('joining_docs/')[1];
      return `${base}/api/v1/joining/documents/${filename}`;
    }

    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Form options from backend
  const [options, setOptions] = useState<{
    departments: { id: number; name: string; code: string }[];
    designations: { id: number; title?: string; name?: string; department_id: number }[];
    shifts: { id: number; name: string; start_time: string; end_time: string }[];
  }>({ departments: [], designations: [], shifts: [] });

  // Office Use inputs state
  const [officeForm, setOfficeForm] = useState({
    approved_employee_code: '',
    official_joining_date: '',
    department_id: '',
    designation_id: '',
    shift_id: '',
    salary_wages: '',
    duty_location: '',
    documents_verified_by: 'HR Admin',
    background_verification: 'completed',
    police_verification: 'completed',
    uniform_issued: true,
    id_card_issued: true,
    admin_remarks: '',
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getJoiningRequests({
        status: activeTab === 'all' ? undefined : activeTab,
        search: search.trim() || undefined,
      });
      setRequests(res.requests);
      setCounts(res.counts);
    } catch (err: any) {
      console.error('Error fetching joining requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const data = await api.getJoiningOptions();
      setOptions(data);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [activeTab, search]);

  const handleOpenReview = (req: JoiningRequest) => {
    setSelectedRequest(req);
    const rawDate = req.official_joining_date || req.date_of_joining;
    const formattedDate = rawDate ? rawDate.split('T')[0].split(' ')[0] : new Date().toISOString().split('T')[0];

    const defaultDept = req.department_id
      ? String(req.department_id)
      : (options.departments && options.departments.length > 0 ? String(options.departments[0].id) : '1');

    const defaultDesig = req.designation_id
      ? String(req.designation_id)
      : (options.designations && options.designations.length > 0 ? String(options.designations[0].id) : '1');

    setOfficeForm({
      approved_employee_code: req.approved_employee_code || req.proposed_employee_code || `SF-${1000 + req.id}`,
      official_joining_date: formattedDate,
      department_id: defaultDept,
      designation_id: defaultDesig,
      shift_id: req.shift_id ? String(req.shift_id) : (options.shifts && options.shifts.length > 0 ? String(options.shifts[0].id) : '1'),
      salary_wages: req.salary_wages ? String(req.salary_wages) : (req.previous_salary ? String(req.previous_salary) : '25000'),
      duty_location: req.duty_location || req.branch_location || 'Headquarters',
      documents_verified_by: req.documents_verified_by || 'HR Operations',
      background_verification: req.background_verification || 'completed',
      police_verification: req.police_verification || 'completed',
      uniform_issued: req.uniform_issued !== undefined ? req.uniform_issued : true,
      id_card_issued: req.id_card_issued !== undefined ? req.id_card_issued : true,
      admin_remarks: req.admin_remarks || 'KYC & documents verified. Approved for Starforce on-field deployment.',
    });
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    const deptId = Number(officeForm.department_id) || (options.departments[0]?.id ? Number(options.departments[0].id) : 1);
    const desigId = Number(officeForm.designation_id) || (options.designations[0]?.id ? Number(options.designations[0].id) : 1);
    const joiningDate = officeForm.official_joining_date || new Date().toISOString().split('T')[0];

    try {
      setProcessing(true);
      const res = await api.approveJoiningRequest(selectedRequest.id, {
        ...officeForm,
        official_joining_date: joiningDate,
        department_id: deptId,
        designation_id: desigId,
        shift_id: officeForm.shift_id ? Number(officeForm.shift_id) : (options.shifts[0]?.id ? Number(options.shifts[0].id) : 1),
        salary_wages: officeForm.salary_wages ? Number(officeForm.salary_wages) : 25000,
      });

      const approvedCode = res?.joining_request?.approved_employee_code || officeForm.approved_employee_code;
      setFeedback({
        type: 'success',
        message: `Approved! Employee record provisioned with code ${approvedCode}. Mobile attendance is now UNLOCKED for this worker!`,
      });
      setSelectedRequest(res?.joining_request || null);
      fetchRequests();
      onUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Approval failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectRemarks.trim()) {
      alert('Please provide the reason for rejection.');
      return;
    }

    try {
      setProcessing(true);
      const updated = await api.rejectJoiningRequest(selectedRequest.id, { admin_remarks: rejectRemarks });
      setFeedback({ type: 'success', message: 'Application rejected. The worker has been notified.' });
      setSelectedRequest(updated);
      setRejectModalOpen(false);
      setRejectRemarks('');
      fetchRequests();
      onUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Rejection failed' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Joining Applications</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Starforce Facilities
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review partner and worker onboarding forms, verify statutory KYC documents, and provision employee IDs to unlock mobile check-in.
          </p>
        </div>

        {counts.pending > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{counts.pending} Action Required (Pending Review)</span>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white border-indigo-400 shadow-sm ring-2 ring-indigo-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Submissions</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{counts.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-50/50 border-amber-400 shadow-sm ring-2 ring-amber-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{counts.pending}</div>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-sm ring-2 ring-emerald-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{counts.approved}</div>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-50/50 border-rose-400 shadow-sm ring-2 ring-rose-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{counts.rejected}</div>
        </div>
      </div>

      {/* Filter, View Mode and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Toggle & Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Form Registrations</span>
            </button>
            <button
              onClick={() => setViewMode('kyc_vault')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kyc_vault'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC Verification Vault</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200/60 text-slate-700 font-bold">
                  {tab === 'all' ? counts.total : counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, phone, Aadhaar, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main View Area: Table or KYC Vault */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
              <p>Loading Starforce joining applications...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">No applications found in this view</p>
              <p className="text-xs text-slate-400 mt-1">When workers submit the Starforce joining form from the mobile app, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Applicant / Worker</th>
                    <th className="py-3.5 px-4">Proposed Role & Location</th>
                    <th className="py-3.5 px-4">Referral Source</th>
                    <th className="py-3.5 px-4">Date of Joining</th>
                    <th className="py-3.5 px-4">Statutory KYC</th>
                    <th className="py-3.5 px-4">Docs Submitted</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {req.photo_url ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-slate-100">
                              <img
                                src={resolveFileUrl(req.photo_url)}
                                alt={req.full_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                              {req.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{req.full_name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{req.phone}</span>
                              {req.approved_employee_code && (
                                <span className="font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-emerald-200">
                                  {req.approved_employee_code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{req.proposed_designation || 'Field Staff'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{req.branch_location || req.proposed_department || 'Headquarters'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {req.referral_source === 'Employee Referral' ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🎁 Ref: {req.referred_by_name || 'Employee'}
                            </span>
                            {req.referral_employee_code && (
                              <span className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {req.referral_employee_code}</span>
                            )}
                          </div>
                        ) : req.referral_source && req.referral_source !== 'Direct Application / Walk-in' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {req.referral_source}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                            Direct / Walk-in
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {(req.official_joining_date || req.date_of_joining || 'Immediate').split('T')[0].split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {req.aadhaar_number && (
                            <div className="text-slate-600 font-mono">
                              <span className="text-slate-400 text-[10px]">Aadhaar:</span> {req.aadhaar_number}
                            </div>
                          )}
                          {req.pan_number && (
                            <div className="text-slate-600 font-mono">
                              <span className="text-slate-400 text-[10px]">PAN:</span> {req.pan_number}
                            </div>
                          )}
                          {!req.aadhaar_number && !req.pan_number && <span className="text-slate-400">—</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          {req.uploaded_documents?.length || req.documents_submitted?.length || 0} Docs
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                            Pending Review
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved & Active
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenReview(req)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                            req.status === 'pending'
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {req.status === 'pending' ? 'Review & Process' : 'View Full Details'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* KYC VERIFICATION VAULT CARDS VIEW */
        <div>
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
              <p>Loading KYC Verification Vault...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-indigo-300" />
              <p className="font-medium text-slate-700 text-sm">No KYC submissions found in this filter</p>
              <p className="text-xs text-slate-400 mt-1">Submitted candidate verification forms and uploaded statutory KYC documents will appear in this vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req) => {
                const docCount = req.uploaded_documents?.length || req.documents_submitted?.length || 0;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Card Top */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {req.photo_url ? (
                            <div
                              onClick={() => setPreviewDoc({ title: 'Candidate Photograph', file_name: `${req.full_name} Photo`, file_url: resolveFileUrl(req.photo_url!) })}
                              className="w-14 h-16 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-2xs shrink-0 cursor-pointer hover:border-indigo-500 transition-colors bg-slate-100"
                              title="Click to view full photograph"
                            >
                              <img
                                src={resolveFileUrl(req.photo_url)}
                                alt={req.full_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                              {req.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{req.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {req.approved_employee_code || req.proposed_employee_code || 'SF-NEW'}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{req.branch_location || req.proposed_department || 'Site Staff'}</span>
                            </div>
                          </div>
                        </div>

                        {req.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            Pending
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* Statutory KYC Details Grid */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        {/* Aadhaar Row */}
                        <div className="flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/60">
                          <span className="text-slate-500 text-[11px]">Aadhaar Card</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {req.aadhaar_number || 'Not Provided'}
                          </span>
                        </div>

                        {/* PAN Row */}
                        <div className="flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/60">
                          <span className="text-slate-500 text-[11px]">PAN Card</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {req.pan_number || 'Not Provided'}
                          </span>
                        </div>

                        {/* Bank Details Row */}
                        <div className="flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/60">
                          <span className="text-slate-500 text-[11px]">Bank Account</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {req.account_number ? `${req.bank_name || 'Bank'} (***${req.account_number.slice(-4)})` : 'Not Provided'}
                          </span>
                        </div>
                      </div>

                      {/* Uploaded Documents List */}
                      <div className="mt-3">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Attached KYC Documents ({docCount}):</span>
                        </div>

                        {req.uploaded_documents && req.uploaded_documents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {req.uploaded_documents.map((d, dIdx) => (
                              <button
                                key={dIdx}
                                onClick={() => setPreviewDoc({ title: d.title, file_name: d.file_name, file_url: resolveFileUrl(d.file_url), mime_type: d.mime_type })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200 transition-colors"
                                title="Click to preview file"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{d.title}</span>
                              </button>
                            ))}
                          </div>
                        ) : req.documents_submitted && req.documents_submitted.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {req.documents_submitted.map((d, dIdx) => (
                              <span key={dIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No statutory attachments uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">
                        Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Review & Verify KYC</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal Dialog - Complete Starforce Facilities Joining Form */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60 rounded-t-3xl">
              <div className="flex items-center gap-3">
                {selectedRequest.photo_url ? (
                  <div
                    onClick={() => setPreviewDoc({ title: 'Candidate Photograph', file_name: `${selectedRequest.full_name} Photo`, file_url: resolveFileUrl(selectedRequest.photo_url!) })}
                    className="w-14 h-16 rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-sm shrink-0 cursor-pointer hover:border-indigo-500 transition-colors bg-slate-100"
                    title="Click to view full photo"
                  >
                    <img
                      src={resolveFileUrl(selectedRequest.photo_url)}
                      alt={selectedRequest.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    SF
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">STARFORCE FACILITIES</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      EMPLOYEE JOINING FORM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applicant: <span className="font-semibold text-slate-800">{selectedRequest.full_name}</span> | Proposed Code:{' '}
                    <span className="font-mono text-slate-700">{selectedRequest.proposed_employee_code || 'SF-NEW'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRequest.status === 'pending' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending Verification
                  </span>
                )}
                {selectedRequest.status === 'approved' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Approved (Code: {selectedRequest.approved_employee_code})
                  </span>
                )}
                {selectedRequest.status === 'rejected' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Application Rejected
                  </span>
                )}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - 11 Starforce Sections */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Section 1: Proposed Joining Details */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Employee & Joining Details (Proposed)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Proposed Employee Code</span>
                    <span className="font-semibold font-mono text-slate-800">{selectedRequest.proposed_employee_code || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Joining</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.date_of_joining || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Proposed Designation</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.proposed_designation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Proposed Department</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.proposed_department || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Branch / Site Location</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.branch_location || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reporting Officer / Manager</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.reporting_officer || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Referral & Reference Information */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Referral & Reference Information</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedRequest.referral_source === 'Employee Referral'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {selectedRequest.referral_source || 'Direct Application / Walk-in'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Referred By (Name)</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.referred_by_name || 'N/A (Direct Application)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Referral Employee Code</span>
                    <span className="font-semibold font-mono text-slate-800">{selectedRequest.referral_employee_code || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Referral Contact Phone</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.referral_phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Relation / Notes</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.referral_notes || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Personal Details & Passport Photograph */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Personal Details & Passport Photograph</span>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {selectedRequest.photo_url ? (
                    <div className="shrink-0 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs text-center w-28">
                      <img
                        src={resolveFileUrl(selectedRequest.photo_url)}
                        alt="Candidate Photo"
                        className="w-24 h-28 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewDoc({ title: 'Candidate Photograph', file_name: `${selectedRequest.full_name} Photo`, file_url: resolveFileUrl(selectedRequest.photo_url!) })}
                      />
                      <button
                        onClick={() => setPreviewDoc({ title: 'Candidate Photograph', file_name: `${selectedRequest.full_name} Photo`, file_url: resolveFileUrl(selectedRequest.photo_url!) })}
                        className="mt-1.5 text-[10px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 justify-center w-full"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs text-center w-28">
                      <div className="w-24 h-28 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[9px]">No Photo</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Full Name</span>
                      <span className="font-semibold text-slate-900">{selectedRequest.full_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Father / Spouse Name</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.father_spouse_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.dob || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Gender & Marital Status</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRequest.gender || '—'} / {selectedRequest.marital_status || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Blood Group</span>
                      <span className="font-semibold text-rose-600 font-mono">{selectedRequest.blood_group || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Alternate Phone</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.alternate_phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Aadhaar Number</span>
                      <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedRequest.aadhaar_number || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">PAN Number</span>
                      <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedRequest.pan_number || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 & 4: Address & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Address Details</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                      <p className="text-slate-800 font-medium">{selectedRequest.permanent_address || '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Current / Local Address</span>
                      <p className="text-slate-800 font-medium">{selectedRequest.current_address || 'Same as permanent'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Emergency Contact Details</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Contact Person</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.emergency_contact_name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Relationship</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.emergency_relationship || '—'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Emergency Phone</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.emergency_phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Emergency Address</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.emergency_address || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Bank Details */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <span>Bank Account Details (Direct Salary Transfer)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">A/C Holder Name</span>
                    <span className="font-semibold text-slate-900">{selectedRequest.account_holder_name || selectedRequest.full_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bank Name & Branch</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRequest.bank_name || '—'} ({selectedRequest.branch_name || 'Main'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Number</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedRequest.account_number || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IFSC Code & UPI</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedRequest.ifsc_code || '—'} {selectedRequest.upi_id ? `(${selectedRequest.upi_id})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 6 & 7: Qualification & Previous Employment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      6
                    </span>
                    <span>Educational Qualification</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Highest Qualification</span>
                      <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {selectedRequest.qualification || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Board / Institution Details</span>
                      {selectedRequest.institution_board?.includes(' | ') ? (
                        <div className="space-y-1 mt-1">
                          {selectedRequest.institution_board.split(' | ').map((line, idx) => (
                            <div key={idx} className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-800 flex items-center gap-1.5 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">{selectedRequest.institution_board || '—'}</span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Passing Year</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.passing_year || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Grade / %</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.percentage_grade || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      7
                    </span>
                    <span>Previous Employment History</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Previous Organization</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.previous_company_name || 'Fresher'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Designation & Period</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRequest.previous_designation || '—'} {selectedRequest.period_of_employment ? `(${selectedRequest.period_of_employment})` : ''}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Last Drawn Salary</span>
                        <span className="font-semibold text-slate-800">
                          {selectedRequest.previous_salary ? `₹${selectedRequest.previous_salary.toLocaleString()}` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reason for Leaving</span>
                        <span className="font-semibold text-slate-800">{selectedRequest.reason_for_leaving || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 8: Statutory KYC Documents & Real File Attachments */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      8
                    </span>
                    <span>Statutory KYC Documents & Real Attachments</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedRequest.uploaded_documents?.length || selectedRequest.documents_submitted?.length || 0} Documents Uploaded
                  </span>
                </div>

                {selectedRequest.uploaded_documents && selectedRequest.uploaded_documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {selectedRequest.uploaded_documents.map((doc, idx) => {
                      const isImg = doc.file_name?.match(/\.(jpg|jpeg|png|webp)$/i) || doc.mime_type?.startsWith('image');
                      const fullUrl = resolveFileUrl(doc.file_url);

                      return (
                        <div
                          key={idx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                              {isImg ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                                <span>{doc.title}</span>
                                <span className="inline-flex items-center text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                                  KYC
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]" title={doc.file_name}>
                                {doc.file_name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{doc.file_size || 'Attached'}</span>
                                {doc.uploaded_at && <span>• {new Date(doc.uploaded_at).toLocaleDateString()}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewDoc({ title: doc.title, file_name: doc.file_name, file_url: fullUrl, mime_type: doc.mime_type })}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.file_name}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Download Document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    <p className="font-semibold text-slate-700 mb-2">Checklist of Documents Attached:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.documents_submitted && selectedRequest.documents_submitted.length > 0 ? (
                        selectedRequest.documents_submitted.map((doc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {doc}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No documents listed.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 9: Worker Declaration & Consent */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                    9
                  </span>
                  <span>Worker Declaration & Consent</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Declaration Form Accepted & Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Signed as: <span className="font-semibold text-slate-800">{selectedRequest.signature_name || selectedRequest.full_name}</span> | Date:{' '}
                    <span className="font-semibold text-slate-800">{selectedRequest.declaration_date || '—'}</span> | Place:{' '}
                    <span className="font-semibold text-slate-800">{selectedRequest.declaration_place || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Section 10: "FOR OFFICE USE ONLY" - The Core Verification & Provisioning Section */}
              <div className="bg-indigo-50/40 p-5 rounded-2xl border-2 border-indigo-200 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-indigo-950 text-base">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>FOR OFFICE USE ONLY (Starforce HR Verification)</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
                    Section 10 of Joining Form
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Approved Employee Code */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Approved Employee Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.approved_employee_code}
                      onChange={(e) => setOfficeForm({ ...officeForm, approved_employee_code: e.target.value })}
                      placeholder="e.g. SF-1045"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Official Joining Date */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Date of Joining <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.official_joining_date}
                      onChange={(e) => setOfficeForm({ ...officeForm, official_joining_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Monthly CTC / Wages */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Salary / Wages (₹)</label>
                    <input
                      type="number"
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.salary_wages}
                      onChange={(e) => setOfficeForm({ ...officeForm, salary_wages: e.target.value })}
                      placeholder="e.g. 28000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.department_id}
                      onChange={(e) => setOfficeForm({ ...officeForm, department_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    >
                      <option value="">Select Department</option>
                      {options.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Designation <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.designation_id}
                      onChange={(e) => setOfficeForm({ ...officeForm, designation_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    >
                      <option value="">Select Designation</option>
                      {options.designations.map((des) => (
                        <option key={des.id} value={des.id}>
                          {des.name || des.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Operational Shift</label>
                    <select
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.shift_id}
                      onChange={(e) => setOfficeForm({ ...officeForm, shift_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    >
                      <option value="">Select Shift</option>
                      {options.shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duty Location */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Duty Location / Client Site</label>
                    <input
                      type="text"
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.duty_location}
                      onChange={(e) => setOfficeForm({ ...officeForm, duty_location: e.target.value })}
                      placeholder="e.g. Sector 62 Noida Hub"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Documents Verified By */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Documents Verified By</label>
                    <input
                      type="text"
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.documents_verified_by}
                      onChange={(e) => setOfficeForm({ ...officeForm, documents_verified_by: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Verification Statuses */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Background Verification</label>
                    <select
                      disabled={selectedRequest.status !== 'pending'}
                      value={officeForm.background_verification}
                      onChange={(e) => setOfficeForm({ ...officeForm, background_verification: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
                    >
                      <option value="completed">Completed / Verified</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Toggles: Uniform & ID Card */}
                <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-indigo-100">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={selectedRequest.status !== 'pending'}
                      checked={officeForm.uniform_issued}
                      onChange={(e) => setOfficeForm({ ...officeForm, uniform_issued: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-800 text-xs">Starforce Uniform Issued</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={selectedRequest.status !== 'pending'}
                      checked={officeForm.id_card_issued}
                      onChange={(e) => setOfficeForm({ ...officeForm, id_card_issued: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-800 text-xs">Official Photo ID Card Issued</span>
                  </label>
                </div>

                {/* Admin Remarks */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">HR & Admin Remarks</label>
                  <textarea
                    rows={2}
                    disabled={selectedRequest.status !== 'pending'}
                    value={officeForm.admin_remarks}
                    onChange={(e) => setOfficeForm({ ...officeForm, admin_remarks: e.target.value })}
                    placeholder="Enter onboarding remarks, statutory notes or instructions..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 disabled:bg-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Review History banner if already processed */}
              {selectedRequest.status !== 'pending' && (
                <div
                  className={`p-4 rounded-2xl border ${
                    selectedRequest.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {selectedRequest.status === 'approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>
                      {selectedRequest.status === 'approved'
                        ? 'Application Approved & Attendance Unlocked'
                        : 'Application Rejected'}
                    </span>
                  </div>
                  <p className="text-xs">
                    Processed by <span className="font-semibold">{selectedRequest.reviewer?.name || 'HR Admin'}</span> on{' '}
                    <span className="font-semibold">
                      {selectedRequest.reviewed_at ? new Date(selectedRequest.reviewed_at).toLocaleString() : 'N/A'}
                    </span>
                    .
                  </p>
                  {selectedRequest.admin_remarks && (
                    <p className="text-xs mt-1 italic">Remarks: "{selectedRequest.admin_remarks}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-b-3xl">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
              >
                Close Preview
              </button>

              {selectedRequest.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    disabled={processing}
                    onClick={() => setRejectModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                  >
                    Reject Application
                  </button>

                  <button
                    disabled={processing}
                    onClick={handleApprove}
                    className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing & Provisioning...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Unlock Mobile Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Reject Joining Application</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the reason for rejection. This will be visible to the worker/partner in their mobile app.
            </p>

            <textarea
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="e.g. Incomplete address proof, Aadhaar name mismatch, or police verification failure..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={processing || !rejectRemarks.trim()}
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive KYC Document & Photo Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{previewDoc.file_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download={previewDoc.file_name}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={previewDoc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Tab</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 min-h-[360px]">
              {previewDoc.file_url.startsWith('data:image') ||
              previewDoc.file_url.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) ||
              previewDoc.mime_type?.startsWith('image') ? (
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.title}
                  className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-md bg-white p-1 border border-slate-200"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried && previewDoc.file_url.includes('/api/v1/joining/documents/')) {
                      target.dataset.tried = 'true';
                      const fn = previewDoc.file_url.split('/api/v1/joining/documents/')[1];
                      target.src = `https://backend-gi0y.onrender.com/storage/joining_docs/${fn}`;
                    }
                  }}
                />
              ) : (
                <iframe
                  src={previewDoc.file_url}
                  title={previewDoc.title}
                  className="w-full h-[72vh] rounded-xl border border-slate-300 bg-white shadow-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
