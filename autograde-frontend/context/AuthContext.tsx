'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('autograde_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/auth/login', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

      const data = await res.json();

      if (res.ok && data.access) {
        const userData: User = {
          username: data.username,
          email: data.email,
          accessToken: data.access,
          refreshToken: data.refresh,
        };
        setUser(userData);
        localStorage.setItem('autograde_user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: data?.detail || data?.message || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Something went wrong' };
    }
  };

  const loginWithOAuth = async (provider: string): Promise<void> => {
    try {
      const res = await fetch(`/api/auth/oauth?provider=${provider}`);
      const data = await res.json();
      if (data.authorize_url) {
        window.location.href = data.authorize_url;
      } else {
        console.error('No OAuth URL in response:', data);
      }
    } catch (err) {
      console.error('OAuth redirect failed', err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autograde_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};