export type UserRole = 'admin' | 'viewer' | 'engineer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
}

export type CaseStatus = 
  | 'Draft' 
  | 'Planning' 
  | 'In Review' 
  | 'Approved' 
  | 'Completed' 
  | 'Cancelled';

export type CasePriority = 'Low' | 'Medium' | 'High';

export interface MedicalCase {
  id: number;
  case_number: string;
  patient_reference: string;
  surgeon_name: string;
  implant_type: string;
  status: CaseStatus;
  priority: CasePriority;
  surgery_date: string | null; // YYYY-MM-DD or empty
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  total: number;
  planning: number;
  in_review: number;
  approved: number;
  completed: number;
  draft: number;
  cancelled: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
}

export interface TestCaseResult {
  id: string;
  name: string;
  requirement: string;
  passed: boolean;
  expectedStatus: number | string;
  actualStatus: number | string;
  details: string;
  requestPayload?: any;
  responsePayload?: any;
  durationMs: number;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}
