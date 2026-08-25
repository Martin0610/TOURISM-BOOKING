import axios from 'axios';
import { getAuthToken, clearAuthSession } from './authStorage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request (isolated per tab)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');

      // Only purge and redirect if not already on an authentication page/endpoint
      if (!isAuthPage && !isAuthEndpoint) {
        clearAuthSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


