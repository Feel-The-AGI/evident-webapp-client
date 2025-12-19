const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evident-api.onrender.com/api';

interface RequestOptions {
  method?: string;
  body?: object;
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ accessToken: string; user: User }>('/auth/register', {
        method: 'POST',
        body: { email, password },
      }),
    login: (email: string, password: string) =>
      request<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
  },
  
  users: {
    me: (token: string) => request<User>('/users/me', { token }),
    canExport: (token: string) => 
      request<{ allowed: boolean; reason?: string }>('/users/can-export', { token }),
  },
  
  logs: {
    create: (token: string, log: CreateLog) =>
      request<Log>('/logs', { method: 'POST', body: log, token }),
    today: (token: string) => request<Log[]>('/logs/today', { token }),
    thisWeek: (token: string) => request<Log[]>('/logs/this-week', { token }),
    lastWeek: (token: string) => request<Log[]>('/logs/last-week', { token }),
    update: (token: string, id: string, log: Partial<CreateLog>) =>
      request<Log>(`/logs/${id}`, { method: 'PATCH', body: log, token }),
    delete: (token: string, id: string) =>
      request<{ deleted: boolean }>(`/logs/${id}`, { method: 'DELETE', token }),
  },
  
  exports: {
    generate: (token: string, startDate: string, endDate: string) =>
      request<ExportResult>('/exports/generate', {
        method: 'POST',
        body: { startDate, endDate },
        token,
      }),
    history: (token: string) => request<ExportHistory[]>('/exports/history', { token }),
  },
  
  subscriptions: {
    checkout: (token: string, successUrl: string, cancelUrl: string) =>
      request<{ sessionId: string; url: string }>('/subscriptions/checkout', {
        method: 'POST',
        body: { successUrl, cancelUrl },
        token,
      }),
    status: (token: string) =>
      request<{ subscriptionStatus: string; trialExportUsed: boolean; exportCount: number }>(
        '/subscriptions/status',
        { token }
      ),
  },
};

export interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  exportCount?: number;
  trialExportUsed?: boolean;
}

export interface Log {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  description: string;
  reference?: string;
  source: 'WEB' | 'MOBILE';
  createdAt: string;
}

export interface CreateLog {
  date: string;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  description: string;
  reference?: string;
  source?: 'WEB' | 'MOBILE';
}

export type ActivityType = 'WORK' | 'MEETING' | 'FIELD' | 'TRAVEL' | 'ADMIN';

export interface ExportResult {
  id: string;
  format: string;
  textContent: string;
  dateRange: { start: string; end: string };
  logCount: number;
}

export interface ExportHistory {
  id: string;
  startDate: string;
  endDate: string;
  format: string;
  createdAt: string;
}
