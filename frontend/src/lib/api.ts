import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Synchronized refresh logic
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, data: any = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(data)));
  failedQueue = [];
};

/**
 * Synchronized refresh function. 
 * Can be called multiple times; only one request will be sent.
 */
export async function refreshTokens(): Promise<{ accessToken: string; user: any } | null> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { data } = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    setAccessToken(data.accessToken);
    processQueue(null, data);
    return data;
  } catch (err) {
    processQueue(err, null);
    clearAccessToken();
    return null;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (original.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const data = await refreshTokens();
        if (!data) return Promise.reject(error);
        
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// In-memory token storage (XSS-safe)
let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (t: string | null) => { _accessToken = t; };
export const clearAccessToken = () => { _accessToken = null; };

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Tasks API
export const tasksApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/tasks', { params }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
  }) => api.post('/tasks', data),
  update: (id: string, data: Partial<{
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  toggle: (id: string) => api.patch(`/tasks/${id}/toggle`),
};
