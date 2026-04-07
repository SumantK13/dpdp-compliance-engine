import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isLoggedIn, logout as authLogout } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getUser());
    }
    setLoading(false);
  }, []);

  const updateUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('dpdp_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    authLogout();
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, logout, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
