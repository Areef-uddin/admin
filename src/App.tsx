import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { AttendanceView } from './components/AttendanceView';
import { LiveTrackingView } from './components/LiveTrackingView';
import { LeavesView } from './components/LeavesView';
import { SalaryStructureView } from './components/SalaryStructureView';
import { PayrollProcessingView } from './components/PayrollProcessingView';
import { PayslipsView } from './components/PayslipsView';
import { AuditLogsView } from './components/AuditLogsView';
import { JoiningRequestsView } from './components/JoiningRequestsView';
import { FieldOfficersReferralView } from './components/FieldOfficersReferralView';
import { LoginView } from './components/LoginView';
import { api } from './services/api';
import {
  User,
  Employee,
  Department,
  Designation,
  AttendanceRecord,
  TrackingEmployee,
  LeaveRequest,
  PayrollRun,
  PayrollItem,
  AuditLog,
  DashboardKPIs,
} from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Core Data States
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trackingList, setTrackingList] = useState<TrackingEmployee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState<string>('2026-10');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingJoiningCount, setPendingJoiningCount] = useState<number>(0);

  // Auto-login or verify session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.me()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            fetchAllData();
          } else {
            handleAutoLogin();
          }
        })
        .catch(() => {
          handleAutoLogin();
        });
    } else {
      handleAutoLogin();
    }
  }, []);

  const handleAutoLogin = async () => {
    setIsAuthLoading(true);
    try {
      const res = await api.login('admin@starforce.com', 'password123');
      setCurrentUser(res.user);
      setIsOnline(true);
      await fetchAllData();
    } catch (e) {
      console.error('Failed auto login:', e);
      setIsOnline(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const res = await api.login(email, pass);
      setCurrentUser(res.user);
      setIsOnline(true);
      await fetchAllData();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  // Main data loader
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        kpiRes,
        empRes,
        deptRes,
        desigRes,
        attRes,
        trackRes,
        leaveRes,
        runRes,
        logsRes,
        joiningRes,
      ] = await Promise.allSettled([
        api.getDashboardKPIs(),
        api.getEmployees(),
        api.getDepartments(),
        api.getDesignations(),
        api.getAttendanceSheet(attendanceDate),
        api.getActiveTracking(),
        api.getLeaveRequests(),
        api.getPayrollRuns(),
        api.getAuditLogs(),
        api.getJoiningRequests(),
      ]);

      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value);
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value);
      if (desigRes.status === 'fulfilled') setDesignations(desigRes.value);
      if (attRes.status === 'fulfilled') setAttendanceRecords(attRes.value);
      if (trackRes.status === 'fulfilled') setTrackingList(trackRes.value);
      if (leaveRes.status === 'fulfilled') setLeaveRequests(leaveRes.value);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value);
      if (joiningRes.status === 'fulfilled') setPendingJoiningCount(joiningRes.value.counts.pending);


      if (runRes.status === 'fulfilled') {
        const runs = runRes.value || [];
        setPayrollRuns(runs);
        const match = runs.find((r: PayrollRun) => r.payroll_month === selectedPayrollMonth) || runs[0] || null;
        setCurrentRun(match);
        if (match) {
          const preview = await api.previewPayroll(match.id);
          setPayrollItems(preview.items || []);
        } else {
          setPayrollItems([]);
        }
      } else {
        setPayrollItems([]);
      }

      setIsOnline(true);
    } catch (err) {
      console.error('Failed to load data:', err);
      setIsOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh when switching tabs
  useEffect(() => {
    if (!currentUser) return;
    if (currentTab === 'attendance') {
      api.getAttendanceSheet(attendanceDate).then(setAttendanceRecords).catch(console.error);
    } else if (currentTab === 'leaves') {
      api.getLeaveRequests().then(setLeaveRequests).catch(console.error);
    } else if (currentTab === 'tracking') {
      api.getActiveTracking().then(setTrackingList).catch(console.error);
    } else if (currentTab === 'payroll' || currentTab === 'payslips') {
      api.getPayrollRuns().then(async (runs) => {
        setPayrollRuns(runs);
        const latest = runs[0] || null;
        setCurrentRun(latest);
        if (latest) {
          const preview = await api.previewPayroll(latest.id);
          setPayrollItems(preview.items || []);
        } else {
          setPayrollItems([]);
        }
      }).catch(console.error);
    }
  }, [currentTab]);

  // Attendance Date Change
  const handleDateChange = async (newDate: string) => {
    setAttendanceDate(newDate);
    setIsRefreshing(true);
    try {
      const recs = await api.getAttendanceSheet(newDate);
      setAttendanceRecords(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add Employee
  const handleAddEmployee = async (payload: any) => {
    const newEmp = await api.createEmployee(payload);
    setEmployees([newEmp, ...employees]);
    // Refresh KPIs
    api.getDashboardKPIs().then(setKpis);
  };

  // Deactivate Employee
  const handleDeactivateEmployee = async (id: number) => {
    await api.deactivateEmployee(id);
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, employment_status: 'terminated' } : emp
      )
    );
  };

  // Delete Employee Permanently
  const handleDeleteEmployee = async (id: number) => {
    await api.deleteEmployee(id);
    setEmployees(employees.filter((emp) => emp.id !== id));
    api.getDashboardKPIs().then(setKpis).catch(console.error);
  };

  // Purge All Test Employees
  const handlePurgeAllEmployees = async () => {
    await api.purgeAllEmployees();
    setEmployees([]);
    api.getDashboardKPIs().then(setKpis).catch(console.error);
  };

  // Leave Actions
  const handleApproveLeave = async (id: number, remarks?: string) => {
    await api.approveLeave(id, remarks);
    setLeaveRequests(
      leaveRequests.map((lr) =>
        lr.id === id ? { ...lr, status: 'approved', approval_remarks: remarks } : lr
      )
    );
    api.getDashboardKPIs().then(setKpis).catch(console.error);
  };

  const handleRejectLeave = async (id: number, remarks?: string) => {
    await api.rejectLeave(id, remarks);
    setLeaveRequests(
      leaveRequests.map((lr) =>
        lr.id === id ? { ...lr, status: 'rejected', approval_remarks: remarks } : lr
      )
    );
    api.getDashboardKPIs().then(setKpis).catch(console.error);
  };

  // Payroll Actions
  const handlePayrollMonthChange = async (month: string) => {
    setSelectedPayrollMonth(month);
    const existingRun = payrollRuns.find((r) => r.payroll_month === month);
    if (existingRun) {
      setCurrentRun(existingRun);
      try {
        const preview = await api.previewPayroll(existingRun.id);
        setPayrollItems(preview.items || []);
      } catch (e) {
        console.error(e);
        setPayrollItems([]);
      }
    } else {
      setCurrentRun(null);
      setPayrollItems([]);
    }
  };

  const handleInitializeMonth = async (month: string) => {
    setIsProcessing(true);
    try {
      const run = await api.createPayrollRun(month);
      // Immediately calculate calculations
      await api.calculatePayroll(run.id);
      const preview = await api.previewPayroll(run.id);
      setCurrentRun(preview.run);
      setPayrollItems(preview.items || []);
      setPayrollRuns([preview.run, ...payrollRuns.filter((r) => r.id !== run.id)]);
      api.getDashboardKPIs().then(setKpis).catch(console.error);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize payroll run');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePayrollRun = async (runId: number) => {
    setIsProcessing(true);
    try {
      await api.deletePayrollRun(runId);
      setPayrollRuns(payrollRuns.filter((r) => r.id !== runId));
      setCurrentRun(null);
      setPayrollItems([]);
      api.getDashboardKPIs().then(setKpis).catch(console.error);
    } catch (err: any) {
      alert(err.message || 'Failed to delete payroll run');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculatePayroll = async () => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      const res = await api.calculatePayroll(currentRun.id);
      setCurrentRun(res.payroll_run);
      const preview = await api.previewPayroll(currentRun.id);
      setPayrollItems(preview.items);
      api.getDashboardKPIs().then(setKpis);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      const updated = await api.approvePayroll(currentRun.id);
      setCurrentRun(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizePayroll = async () => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      const updated = await api.finalizePayroll(currentRun.id);
      setCurrentRun(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishPayslips = async () => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      await api.publishPayslips(currentRun.id);
      setCurrentRun({ ...currentRun, status: 'published' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} isLoading={isAuthLoading} />;
  }

  // Titles mapping
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Company Operational Dashboard',
      subtitle: 'Real-time overview of workforce attendance, payroll status, and key metrics',
    },
    'joining-requests': {
      title: 'KYC & Form Registrations Portal',
      subtitle: 'Review candidate registration forms, inspect statutory KYC documents, and provision worker IDs',
    },
    employees: {
      title: 'Employee Directory & Profiles',
      subtitle: 'Manage organizational hierarchy, contracts, salaries, and bank accounts',
    },
    attendance: {
      title: 'Attendance Sheet & GPS Logs',
      subtitle: 'Daily check-in timestamps, working durations, and field evidence',
    },
    tracking: {
      title: 'Live Workforce Radar & Tracking',
      subtitle: 'Real-time GPS telemetry of active on-duty field service engineers',
    },
    leaves: {
      title: 'Leave & Absence Management',
      subtitle: 'Review, approve, or reject employee leave requests and balance quotas',
    },
    'salary-structure': {
      title: 'Salary Structure & Policy Rules',
      subtitle: 'CTC component breakdown, EPF statutory deductions, and tax compliance',
    },
    payroll: {
      title: 'Monthly Payroll Processing',
      subtitle: 'Automated salary computation engine with attendance and LOP deductions',
    },
    payslips: {
      title: 'Payslip Center & Distribution',
      subtitle: 'View, generate, and print official corporate salary vouchers',
    },
    'audit-logs': {
      title: 'Audit Trail & Compliance Records',
      subtitle: 'Security log of administrative changes, calculations, and access events',
    },
  };

  const activeHeader = titles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onDutyCount={trackingList.length}
        pendingJoiningCount={pendingJoiningCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <Header
          title={activeHeader.title}
          subtitle={activeHeader.subtitle}
          isOnline={isOnline}
          onRefresh={fetchAllData}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {currentTab === 'dashboard' && (
            <DashboardView kpis={kpis} onNavigate={setCurrentTab} />
          )}

          {currentTab === 'joining-requests' && (
            <JoiningRequestsView onUpdated={fetchAllData} />
          )}

          {currentTab === 'field-referrals' && (
            <FieldOfficersReferralView />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              departments={departments}
              designations={designations}
              onAddEmployee={handleAddEmployee}
              onDeactivateEmployee={handleDeactivateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onPurgeAllEmployees={handlePurgeAllEmployees}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              records={attendanceRecords}
              currentDate={attendanceDate}
              onDateChange={handleDateChange}
              onRefresh={() => handleDateChange(attendanceDate)}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'tracking' && (
            <LiveTrackingView
              trackingList={trackingList}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'leaves' && (
            <LeavesView
              leaveRequests={leaveRequests}
              onApprove={handleApproveLeave}
              onReject={handleRejectLeave}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'salary-structure' && <SalaryStructureView />}

          {currentTab === 'payroll' && (
            <PayrollProcessingView
              currentRun={currentRun}
              items={payrollItems}
              selectedMonth={selectedPayrollMonth}
              onMonthChange={handlePayrollMonthChange}
              onInitializeMonth={handleInitializeMonth}
              onCalculate={handleCalculatePayroll}
              onApprove={handleApprovePayroll}
              onFinalize={handleFinalizePayroll}
              onPublish={handlePublishPayslips}
              onDeleteRun={handleDeletePayrollRun}
              isProcessing={isProcessing}
            />
          )}

          {currentTab === 'payslips' && (
            <PayslipsView
              items={payrollItems}
              payrollMonth={currentRun?.payroll_month || selectedPayrollMonth}
            />
          )}

          {currentTab === 'audit-logs' && <AuditLogsView logs={auditLogs} />}
        </main>
      </div>
    </div>
  );
}

export default App;
