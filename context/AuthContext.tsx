'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import api from '@/lib/api';
import { getAuthToken, getAuthUser, setAuthSession, clearAuthSession } from '@/lib/authStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentToken = getAuthToken();
      if (currentToken) {
        const res = await api.get('/api/auth/me');
        if (res.data?.data) {
          setUser(res.data.data);
          setAuthSession(currentToken, res.data.data);
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      refreshUser();
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data.data;
    setAuthSession(authToken, loggedInUser);
    setToken(authToken);
    setUser(loggedInUser);
    refreshUser();
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post('/api/auth/register', { name, email, password, phone });
    const { user: registeredUser, token: authToken } = res.data.data;
    setAuthSession(authToken, registeredUser);
    setToken(authToken);
    setUser(registeredUser);
    refreshUser();
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saved_phone');
      localStorage.removeItem('saved_country_code');
      sessionStorage.removeItem('last_entered_phone');
      sessionStorage.removeItem('last_country_code');
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('pending_booking_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
