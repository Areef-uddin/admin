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
  JoiningRequest,
  JoiningRequestCounts,
} from '../types';

const RAW_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://backend-gi0y.onrender.com' : '')).replace(/\/+$/, '');
const API_BASE = `${RAW_BASE}/api/v1`;

let isRefreshingAuth = false;
let authRefreshPromise: Promise<string | null> | null = null;

async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || res.statusText || `HTTP ${res.status}` };
  }
}

async function refreshAdminToken(): Promise<string | null> {
  if (isRefreshingAuth && authRefreshPromise) {
    return authRefreshPromise;
  }
  isRefreshingAuth = true;
  authRefreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: 'admin@starforce.com', password: 'password123' }),
      });
      const data = await safeJson(res);
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        return data.token as string;
      }
    } catch (e) {
      console.error('Auto login failed:', e);
    } finally {
      isRefreshingAuth = false;
      authRefreshPromise = null;
    }
    return null;
  })();
  return authRefreshPromise;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, automatically refresh token & retry once
  if (res.status === 401) {
    const freshToken = await refreshAdminToken();
    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.message || data.error || `Login failed (${res.status})`);
    }
    localStorage.setItem('token', data.token);
    return data;
  },

  async me(): Promise<{ user: User }> {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    const json = await safeJson(res);
    if (!res.ok || !json.user) {
      throw new Error(json.message || 'Unauthenticated');
    }
    return json;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Dashboard
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const res = await fetchWithAuth(`${API_BASE}/admin/dashboard`);
    const json = await res.json();
    return json.data;
  },

  // Employees
  async getEmployees(params?: { search?: string; department_id?: number }): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department_id) query.append('department_id', params.department_id.toString());

    const res = await fetchWithAuth(`${API_BASE}/employees?${query.toString()}`);
    const json = await res.json();
    return json.data?.data || json.data || [];
  },

  async createEmployee(payload: any): Promise<Employee> {
    const res = await fetchWithAuth(`${API_BASE}/employees`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create employee');
    return json.data;
  },

  async updateEmployee(id: number, payload: any): Promise<Employee> {
    const res = await fetchWithAuth(`${API_BASE}/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update employee');
    return json.data;
  },

  async deactivateEmployee(id: number): Promise<void> {
    await fetchWithAuth(`${API_BASE}/employees/${id}/deactivate`, {
      method: 'POST',
    });
  },

  async deleteEmployee(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await safeJson(res);
      throw new Error(json.message || 'Failed to delete employee');
    }
  },

  async purgeAllEmployees(): Promise<{ message: string }> {
    const res = await fetchWithAuth(`${API_BASE}/employees/purge-all`, {
      method: 'POST',
    });
    const json = await safeJson(res);
    if (!res.ok) throw new Error(json.message || 'Failed to purge employees');
    return json;
  },

  // Organization
  async getDepartments(): Promise<Department[]> {
    const res = await fetchWithAuth(`${API_BASE}/departments`);
    const json = await res.json();
    return json.data || [];
  },

  async getDesignations(): Promise<Designation[]> {
    const res = await fetchWithAuth(`${API_BASE}/designations`);
    const json = await res.json();
    return json.data || [];
  },

  // Attendance
  async getAttendanceSheet(date?: string): Promise<AttendanceRecord[]> {
    const query = date ? `?date=${date}` : '';
    const res = await fetchWithAuth(`${API_BASE}/admin/attendance${query}`);
    const json = await res.json();
    return json.data || [];
  },

  // Live Tracking
  async getActiveTracking(): Promise<TrackingEmployee[]> {
    const res = await fetchWithAuth(`${API_BASE}/admin/tracking/active`);
    const json = await res.json();
    return json.data || [];
  },

  // Leaves
  async getLeaveRequests(status?: string): Promise<LeaveRequest[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetchWithAuth(`${API_BASE}/admin/leave/requests${query}`);
    const json = await res.json();
    return json.data?.data || json.data || [];
  },

  async approveLeave(id: number, remarks?: string): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/leave/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to approve leave request');
    }
  },

  async rejectLeave(id: number, remarks?: string): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/leave/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to reject leave request');
    }
  },

  // Payroll Runs
  async getPayrollRuns(): Promise<PayrollRun[]> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs`);
    const json = await res.json();
    return json.data || [];
  },

  async createPayrollRun(payrollMonth: string): Promise<PayrollRun> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs`, {
      method: 'POST',
      body: JSON.stringify({ payroll_month: payrollMonth }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create payroll run');
    return json.data;
  },

  async calculatePayroll(runId: number): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}/calculate`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Calculation failed');
    return json.data;
  },

  async previewPayroll(runId: number): Promise<{ run: PayrollRun; items: PayrollItem[] }> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}/preview`);
    const json = await res.json();
    return {
      run: json.data,
      items: json.data?.items || [],
    };
  },

  async approvePayroll(runId: number, notes?: string): Promise<PayrollRun> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Approval failed');
    return json.data;
  },

  async finalizePayroll(runId: number): Promise<PayrollRun> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}/finalize`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Finalization failed');
    return json.data;
  },

  async publishPayslips(runId: number): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}/publish-payslips`, {
      method: 'POST',
    });
    return res.json();
  },

  async deletePayrollRun(runId: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/${runId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete payroll run');
    }
  },

  async purgeAllPayrollRuns(): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/admin/payroll-runs/purge-all`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to purge payroll runs');
    }
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetchWithAuth(`${API_BASE}/admin/audit-logs`);
    const json = await res.json();
    return json.data?.data || json.data || [];
  },

  // Starforce Joining Requests
  async getJoiningRequests(params?: { status?: string; search?: string }): Promise<{ requests: JoiningRequest[]; counts: JoiningRequestCounts }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetchWithAuth(`${API_BASE}/admin/joining-requests?${query.toString()}`);
    const json = await res.json();
    return {
      requests: json.data || [],
      counts: json.counts || { total: 0, pending: 0, approved: 0, rejected: 0 },
    };
  },

  async getJoiningRequest(id: number): Promise<JoiningRequest> {
    const res = await fetchWithAuth(`${API_BASE}/admin/joining-requests/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load request');
    return json.data;
  },

  async getJoiningOptions(): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/joining/options`);
    const json = await res.json();
    return json.data;
  },

  async approveJoiningRequest(id: number, data: any): Promise<{ joining_request: JoiningRequest; employee: any }> {
    const res = await fetchWithAuth(`${API_BASE}/admin/joining-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to approve joining request');
    return json.data;
  },

  async rejectJoiningRequest(id: number, data: { admin_remarks: string }): Promise<JoiningRequest> {
    const res = await fetchWithAuth(`${API_BASE}/admin/joining-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject joining request');
    return json.data;
  },

  // Field Officers & Referrals
  async getFieldOfficers(): Promise<any[]> {
    const res = await fetchWithAuth(`${API_BASE}/field-officers`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load field officers');
    return json.data || [];
  },

  async getOfficerReferrals(code: string): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/field-officers/${code}/referrals`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load officer referrals');
    return json.data || {};
  },

  async punchOfficer(code: string, action = 'toggle'): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/field-officers/${code}/punch`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to punch duty');
    return json;
  },
};
