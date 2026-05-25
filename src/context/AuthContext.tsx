'use client';

import { createContext, useContext } from 'react';

const AuthContext = createContext<Record<string, unknown> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);