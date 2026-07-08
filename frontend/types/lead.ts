export interface LeadFormValues {
  fullName: string;
  email: string;
  businessName?: string;
  message: string;
}

export type LeadScore = 'Hot' | 'Warm' | 'Cold';
export type QualificationStatus = 'pending' | 'qualified' | 'fallback' | 'failed';

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  business_name: string | null;
  message: string;
  ai_score: LeadScore;
  ai_score_reason: string;
  ai_email_draft: string;
  ai_model: string;
  qualification_status: QualificationStatus;
  ai_qualified_at: string | null;
  created_at: string;
}

export interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  fallback: number;
  last_7_days: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, unknown>;
}
