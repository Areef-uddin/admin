import React, { useState } from 'react';
import {
  Users,
  Search,
  Building,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  X,
  CheckCircle,
  UserPlus,
  Shield,
  FileText,
  Award,
  Briefcase,
  MapPin,
  ExternalLink,
  HeartHandshake,
  UserCheck,
  BadgeCheck,
  Trash2,
} from 'lucide-react';
import { Employee, Department, Designation } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  departments: Department[];
  designations: Designation[];
  onAddEmployee: (payload: any) => Promise<void>;
  onDeactivateEmployee: (id: number) => Promise<void>;
  onDeleteEmployee?: (id: number) => Promise<void>;
  onPurgeAllEmployees?: () => Promise<void>;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  designations,
  onAddEmployee,
  onDeactivateEmployee,
  onDeleteEmployee,
  onPurgeAllEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_code: `SF-${1000 + employees.length + 1}`,
    department_id: departments[0]?.id || 1,
    designation_id: designations[0]?.id || 1,
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'full_time',
    base_ctc: 35000,
    work_location: 'Head Office',
    bank_name: 'HDFC Bank',
    account_number: '50100' + Math.floor(10000000 + Math.random() * 90000000),
    ifsc_code: 'HDFC0001234',
  });

  const filteredEmployees = employees.filter((emp) => {
    // Exclude internal field officers (SF-FO) so only form-submitted candidates and staff remain
    if (emp.employee_code && emp.employee_code.startsWith('SF-FO')) {
      return false;
    }

    const jReq = emp.joining_request || emp.user?.joining_request;
    const refName = jReq?.referred_by_name || '';

    const matchesSearch =
      emp.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.work_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDept === 'all' || emp.department_id?.toString() === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddEmployee(formData);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        employee_code: `SF-${1000 + employees.length + 2}`,
        department_id: departments[0]?.id || 1,
        designation_id: designations[0]?.id || 1,
        joining_date: new Date().toISOString().split('T')[0],
        employment_type: 'full_time',
        base_ctc: 35000,
        work_location: 'Head Office',
        bank_name: 'HDFC Bank',
        account_number: '50100' + Math.floor(10000000 + Math.random() * 90000000),
        ifsc_code: 'HDFC0001234',
      });
    } catch (err: any) {
      alert(err.message || 'Error adding employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, code, department, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm transition-all"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm font-medium"
          >
            <option value="all">All Departments ({employees.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id.toString()}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {employees.length > 0 && onPurgeAllEmployees && (
            <button
              onClick={async () => {
                if (confirm(`PERMANENT ACTION: Are you sure you want to delete ALL ${employees.length} employee test records from the database? This will clear the table completely.`)) {
                  await onPurgeAllEmployees();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              title="Clean test employee records from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Test Records</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Department & Role</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Referred By</th>
                <th className="py-3.5 px-6">Monthly CTC</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                        <Users className="w-7 h-7" />
                      </div>
                      <div className="text-base font-semibold text-slate-700 mb-1">No Employees in Directory</div>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        All test records have been purged. Use "+ Add Employee" to onboard active staff.
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add First Employee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                const ctc = emp.current_salary_assignment?.base_monthly_ctc || 35000;
                const net = emp.current_salary_assignment?.net_salary || Math.round(ctc * 0.88);
                const jReq = emp.joining_request || emp.user?.joining_request;
                const referrerName = jReq?.referred_by_name;
                const referralCode = jReq?.referral_employee_code;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                          {emp.user?.name ? emp.user.name.charAt(0) : 'E'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {emp.user?.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-indigo-600 font-semibold">{emp.employee_code}</span>
                            <span>•</span>
                            <span>{emp.user?.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-medium">{emp.department?.name || 'General'}</div>
                      <div className="text-xs text-slate-500">{emp.designation?.name || 'Staff'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs font-medium text-slate-700">{emp.work_location}</div>
                      <div className="text-[11px] text-slate-500">Joined {emp.joining_date}</div>
                    </td>

                    <td className="py-4 px-6">
                      {referrerName ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-bold">{referrerName}</span>
                          </span>
                          {referralCode && (
                            <span className="text-[10px] font-mono text-slate-400 pl-1">{referralCode}</span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <span>Direct / Self</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">₹{Number(ctc).toLocaleString('en-IN')}</div>
                      <div className="text-xs text-emerald-600 font-semibold">Net ~₹{Number(net).toLocaleString('en-IN')}/mo</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        emp.employment_status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.employment_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="capitalize">{emp.employment_status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(emp);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 transition-all shadow-sm"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Onboard New Employee</h3>
                  <p className="text-xs text-slate-500">Creates user profile, role, bank record, and salary structure</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul.sharma@starforce.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
                  <select
                    value={formData.designation_id}
                    onChange={(e) => setFormData({ ...formData, designation_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly CTC (INR)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.base_ctc}
                    onChange={(e) => setFormData({ ...formData, base_ctc: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Confirm & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Drawer */}
      {selectedEmployee && (() => {
        const jReq = selectedEmployee.user?.joining_request || selectedEmployee.joining_request;
        const docs = jReq?.uploaded_documents || [];
        const hasJoining = Boolean(jReq);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Employee Profile</span>
                    {hasJoining && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        KYC Registered
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border border-white/20">
                    {selectedEmployee.user?.name ? selectedEmployee.user.name.charAt(0) : 'E'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{selectedEmployee.user?.name}</h3>
                    <div className="text-xs text-blue-600 font-mono font-bold">{selectedEmployee.employee_code}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {selectedEmployee.designation?.name || jReq?.proposed_designation || 'Staff'} • {selectedEmployee.department?.name || jReq?.proposed_department || 'General'}
                    </div>
                  </div>
                </div>

                {/* Referral Association Banner */}
                {jReq?.referred_by_name && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Referred By Field Officer
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {jReq.referred_by_name} {jReq.referral_employee_code ? `(${jReq.referral_employee_code})` : ''}
                        </div>
                        {jReq.referral_phone && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Phone: {jReq.referral_phone}</div>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                      Referral
                    </span>
                  </div>
                )}

                {/* Contact & Deployment */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedEmployee.user?.email || jReq?.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{selectedEmployee.user?.phone || jReq?.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Building className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{selectedEmployee.work_location || jReq?.duty_location || jReq?.branch_location || 'Head Office'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Official Joining: {selectedEmployee.joining_date || jReq?.official_joining_date || jReq?.date_of_joining || '—'}</span>
                  </div>
                </div>

                {/* Joining Form KYC Details */}
                {hasJoining && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Candidate Identity & KYC Data</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Aadhaar Number</span>
                        <span className="font-mono font-medium text-slate-800">{jReq?.aadhaar_number || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">PAN Card</span>
                        <span className="font-mono font-medium text-slate-800">{jReq?.pan_number || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Blood Group</span>
                        <span className="font-semibold text-rose-600">{jReq?.blood_group || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Father / Spouse</span>
                        <span className="font-medium text-slate-800">{jReq?.father_spouse_name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date of Birth</span>
                        <span className="font-medium text-slate-800">{jReq?.dob || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Marital Status</span>
                        <span className="font-medium text-slate-800 capitalize">{jReq?.marital_status || '—'}</span>
                      </div>
                    </div>

                    {(jReq?.permanent_address || jReq?.current_address) && (
                      <div className="pt-2 border-t border-indigo-100/70 text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Permanent / Current Address</span>
                        <p className="text-slate-700 mt-0.5 leading-relaxed">{jReq?.permanent_address || jReq?.current_address}</p>
                      </div>
                    )}

                    {(jReq?.emergency_contact_name || jReq?.emergency_phone) && (
                      <div className="pt-2 border-t border-indigo-100/70 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Emergency Contact</span>
                          <span className="font-medium text-slate-800">{jReq?.emergency_contact_name || 'Family Contact'}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-700">{jReq?.emergency_phone || '—'}</span>
                      </div>
                    )}

                    {(jReq?.qualification || jReq?.previous_company_name) && (
                      <div className="pt-2 border-t border-indigo-100/70 text-xs space-y-1">
                        {jReq?.qualification && (
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase font-semibold">Education: </span>
                            <span className="text-slate-800 font-medium">{jReq.qualification} {jReq.institution_board ? `(${jReq.institution_board})` : ''}</span>
                          </div>
                        )}
                        {jReq?.previous_company_name && (
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase font-semibold">Past Experience: </span>
                            <span className="text-slate-800 font-medium">{jReq.previous_company_name} {jReq.previous_designation ? `• ${jReq.previous_designation}` : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Attached KYC Documents Vault */}
                {docs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Submitted KYC Documents ({docs.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {docs.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{d.title || d.file_name}</div>
                              {d.file_size && <div className="text-[10px] text-slate-400 font-mono">{d.file_size}</div>}
                            </div>
                          </div>
                          {d.file_url && (
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1 shrink-0"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salary Breakdown Card */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Salary & CTC Structure</h4>
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Base Monthly CTC</span>
                      <span className="font-bold text-slate-900">
                        ₹{Number(selectedEmployee.current_salary_assignment?.base_monthly_ctc || jReq?.salary_wages || 35000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Basic Salary (50%)</span>
                      <span>₹{Number(selectedEmployee.current_salary_assignment?.basic_salary || Math.round((jReq?.salary_wages || 35000) * 0.5)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>HRA Allowance</span>
                      <span>₹{Number(selectedEmployee.current_salary_assignment?.hra || Math.round((jReq?.salary_wages || 35000) * 0.2)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Special Allowance</span>
                      <span>₹{Number(selectedEmployee.current_salary_assignment?.special_allowance || Math.round((jReq?.salary_wages || 35000) * 0.3)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-rose-600 font-medium">
                      <span>Provident Fund (PF)</span>
                      <span>-₹{Number(selectedEmployee.current_salary_assignment?.pf_employee || 1800).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Professional Tax (PT)</span>
                      <span>-₹200.00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-emerald-600 text-sm">
                      <span>Estimated Net Take-Home</span>
                      <span>
                        ₹{Number(selectedEmployee.current_salary_assignment?.net_salary || ((jReq?.salary_wages || 35000) - 2000)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Account Verification */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Disbursement Bank Account</h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedEmployee.bank_account?.bank_name || jReq?.bank_name || 'Bank Account'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          A/C: {selectedEmployee.bank_account?.account_number || jReq?.account_number || '—'}
                        </div>
                        {(selectedEmployee.bank_account?.ifsc_code || jReq?.ifsc_code) && (
                          <div className="text-[10px] font-mono text-slate-400">
                            IFSC: {selectedEmployee.bank_account?.ifsc_code || jReq?.ifsc_code}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex gap-3">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to deactivate ${selectedEmployee.user.name}?`)) {
                      onDeactivateEmployee(selectedEmployee.id);
                      setSelectedEmployee(null);
                    }
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`PERMANENT DELETE: Are you sure you want to delete ${selectedEmployee.user.name} and remove all related data from the database?`)) {
                      if (onDeleteEmployee) {
                        await onDeleteEmployee(selectedEmployee.id);
                        setSelectedEmployee(null);
                      }
                    }
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
