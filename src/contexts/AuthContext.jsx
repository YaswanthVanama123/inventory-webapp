import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getToken = () => localStorage.getItem('authToken');

const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

const authFetch = async (path, { method = 'GET', body, auth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  const loadUserFromStorage = useCallback(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      setLoading(false);
      setUser(null);
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Error parsing stored user:', err);
      setToken(null);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.message || 'An error occurred during login';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) {
        await authFetch('/auth/logout', { method: 'POST', auth: true });
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      setUser(null);
      setError(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!getToken()) {
      return { success: false, error: 'Not authenticated' };
    }
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch('/auth/change-password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
        auth: true,
      });
      return { success: true, message: data.message || 'Password changed successfully' };
    } catch (err) {
      const message = err.message || 'An error occurred while changing password';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    logout,
    changePassword,
    refreshUser: loadUserFromStorage,
    setUser,
    setIsAuthenticated: () => {},
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
