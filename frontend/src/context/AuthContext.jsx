import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('cc_token');
    if (!storedToken) { setLoading(false); return; }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = (tokenValue, userData) => {
    localStorage.setItem('cc_token', tokenValue);
    localStorage.setItem('cc_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('cc_user', JSON.stringify({ ...user, ...userData }));
  };

  const isAuthenticated = !!token && !!user;
  const isStudent = user?.role === 'student';
  const isCoordinator = user?.role === 'coordinator';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated,
      isStudent, isCoordinator, isAdmin,
      login, logout, updateUser, fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
