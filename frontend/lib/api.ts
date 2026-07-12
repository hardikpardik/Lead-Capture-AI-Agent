import type { LeadFormSchema } from '@/lib/validation';
import type { ApiResponse, Lead, LeadStats } from '@/types/lead';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

type FieldErrors = Record<string, string>;

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new Error('Could not reach the server. Please check that the API is running.');
  }

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Received an unexpected response from the server.');
  }

  if (!response.ok) {
    const error = new Error(payload.message || 'Something went wrong. Please try again.') as Error & {
      fieldErrors?: FieldErrors;
    };

    error.fieldErrors = Object.fromEntries(
      Object.entries(payload.errors || {}).filter(([, value]) => typeof value === 'string')
    ) as FieldErrors;
    throw error;
  }

  return payload;
}

export async function submitLead(values: LeadFormSchema): Promise<ApiResponse<Lead>> {
  return request<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

function adminHeaders(adminToken?: string): HeadersInit {
  return adminToken ? { 'x-admin-token': adminToken } : {};
}

export async function fetchLeads(adminToken?: string): Promise<Lead[]> {
  const payload = await request<Lead[]>('/leads', {
    cache: 'no-store',
    headers: adminHeaders(adminToken),
  });
  return payload.data || [];
}

export async function fetchLeadStats(adminToken?: string): Promise<LeadStats> {
  const payload = await request<LeadStats>('/leads/stats', {
    cache: 'no-store',
    headers: adminHeaders(adminToken),
  });
  return payload.data || {
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    fallback: 0,
    last_7_days: 0,
  };
}
