'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, setAccessToken, clearAccessToken, api, refreshTokens } from './api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initial optimistic hydration from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('momentum_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Attempt silent refresh on mount
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const data = await refreshTokens();
        if (data) {
          setUser(data.user);
          localStorage.setItem('momentum_user', JSON.stringify(data.user));
        } else {
          // If refresh fails, clear the stale user from localStorage
          setUser(null);
          localStorage.removeItem('momentum_user');
        }
      } catch {
        // Not logged in — that's fine
        setUser(null);
        localStorage.removeItem('momentum_user');
      } finally {
        setLoading(false);
      }
    };
    tryRefresh();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('momentum_user', JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('momentum_user', JSON.stringify(data.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
      setUser(null);
      localStorage.removeItem('momentum_user');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
