/**
 * Isolated per-tab session storage helper for TripEase.
 * Using sessionStorage ensures each browser tab has its own independent
 * authentication context, allowing multi-account testing (e.g. Admin in Tab 1,
 * Customer in Tab 2) without token overwriting.
 */

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const getAuthUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: any) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', typeof user === 'string' ? user : JSON.stringify(user));
  // Clear global storage to prevent cross-tab contamination
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
