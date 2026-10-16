export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  employees_count?: number;
}

export interface Designation {
  id: number;
  name: string;
  code?: string;
  department_id?: number;
  min_salary?: number;
  max_salary?: number;
}

export interface BankAccount {
  id: number;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string;
  is_primary: boolean;
  is_verified: boolean;
}

export interface SalaryAssignment {
  id: number;
  base_monthly_ctc: number;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  pf_employee: number;
  pf_employer: number;
  esic_employee?: number;
  professional_tax: number;
  tds_estimate: number;
  gross_salary: number;
  net_salary: number;
  effective_from: string;
  is_active: boolean;
}

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  department_id: number;
  designation_id: number;
  joining_date: string;
  employment_status: 'active' | 'probation' | 'notice' | 'terminated' | 'resigned';
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  work_location: string;
  emergency_contact?: string;
  emergency_phone?: string;
  dob?: string;
  gender?: string;
  pan_number?: string;
  aadhaar_number?: string;
  user: User;
  department?: Department;
  designation?: Designation;
  bank_account?: BankAccount;
  current_salary_assignment?: SalaryAssignment;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  work_date: string;
  check_in_at?: string;
  check_out_at?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_in_address?: string;
  check_out_lat?: number;
  check_out_lng?: number;
  check_out_address?: string;
  status: 'present' | 'half_day' | 'absent' | 'on_leave' | 'late' | 'holiday';
  total_minutes: number;
  late_minutes: number;
  overtime_minutes: number;
  is_verified: boolean;
  verification_method: string;
  employee: {
    id: number;
    employee_code: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    department?: {
      name: string;
    };
  };
  shift?: {
    name: string;
    start_time: string;
    end_time: string;
  };
}

export interface TrackingEmployee {
  session_id: number;
  employee_id: number;
  employee_code: string;
  name: string;
  department: string;
  designation: string;
  phone?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  battery_level: number;
  speed: number;
  recorded_at: string;
  minutes_ago: number | null;
  status: 'online' | 'stale' | 'unavailable';
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approval_remarks?: string;
  approved_at?: string;
  employee: {
    employee_code: string;
    user: {
      name: string;
      email: string;
    };
    department?: {
      name: string;
    };
  };
  leave_type: {
    name: string;
    code: string;
    is_paid: boolean;
  };
}

export interface PayrollRun {
  id: number;
  payroll_month: string;
  year: number;
  month: number;
  status: 'draft' | 'calculated' | 'submitted' | 'approved' | 'finalized' | 'published';
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net_pay: number;
  created_by?: number;
  approved_by?: number;
  approved_at?: string;
  finalized_at?: string;
  notes?: string;
}

export interface PayrollItem {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  total_days_in_month: number;
  payable_days: number;
  present_days: number;
  leave_days: number;
  lop_days: number;
  basic_pay: number;
  hra: number;
  special_allowance: number;
  overtime_pay: number;
  gross_earnings: number;
  lop_deduction: number;
  pf_deduction: number;
  esic_deduction: number;
  pt_deduction: number;
  tds_deduction: number;
  total_deductions: number;
  net_pay: number;
  payment_status: string;
  employee: Employee;
  components?: {
    id: number;
    component_name: string;
    component_code: string;
    component_type: 'earning' | 'deduction';
    amount: number;
  }[];
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  description?: string;
  ip_address?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface DashboardKPIs {
  total_employees: number;
  present_today: number;
  attendance_percentage: number;
  on_duty_field_staff: number;
  pending_leaves: number;
  current_month: string;
  latest_payroll?: {
    id: number;
    month: string;
    status: string;
    total_gross: number;
    total_deductions?: number;
    total_net: number;
    total_employees: number;
  };
  departments: {
    id: number;
    name: string;
    count: number;
  }[];
}

export interface JoiningRequest {
  id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  // 1. Employee & Joining Details
  proposed_employee_code?: string;
  date_of_joining?: string;
  proposed_designation?: string;
  proposed_department?: string;
  branch_location?: string;
  reporting_officer?: string;
  // 2. Personal Details
  full_name: string;
  father_spouse_name?: string;
  dob?: string;
  gender?: string;
  marital_status?: string;
  blood_group?: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  aadhaar_number?: string;
  pan_number?: string;
  emergency_contact_name?: string;
  // 3. Address Details
  permanent_address?: string;
  current_address?: string;
  // 4. Emergency Contact Details
  emergency_relationship?: string;
  emergency_phone?: string;
  emergency_address?: string;
  // 5. Bank Details
  account_holder_name?: string;
  bank_name?: string;
  branch_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  // 6. Educational Qualification
  qualification?: string;
  institution_board?: string;
  passing_year?: string;
  percentage_grade?: string;
  // 7. Previous Employment
  previous_company_name?: string;
  previous_designation?: string;
  period_of_employment?: string;
  reason_for_leaving?: string;
  previous_salary?: number;
  // 8. Photo & Documents Submitted
  photo_url?: string;
  documents_submitted?: string[];
  uploaded_documents?: Array<{
    title: string;
    file_name: string;
    file_url: string;
    relative_url?: string;
    file_size?: string;
    mime_type?: string;
    uploaded_at?: string;
  }>;
  // 9. Employee Declaration
  declaration_accepted: boolean;
  signature_name?: string;
  declaration_date?: string;
  declaration_place?: string;
  // 10. For Office Use Only
  approved_employee_code?: string;
  official_joining_date?: string;
  department_id?: number;
  designation_id?: number;
  salary_wages?: number;
  duty_location?: string;
  shift_id?: number;
  documents_verified_by?: string;
  background_verification?: 'completed' | 'pending';
  police_verification?: 'completed' | 'pending' | 'na';
  uniform_issued?: boolean;
  id_card_issued?: boolean;
  admin_remarks?: string;
  // Relations & Meta
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  department?: Department;
  designation?: Designation;
  shift?: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  };
  reviewer?: User;
}

export interface JoiningRequestCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

