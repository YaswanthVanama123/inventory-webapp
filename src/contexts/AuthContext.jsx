import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthContext = createContext(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  
  const getToken = () => localStorage.getItem('authToken');

  
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  
  const loadUserFromStorage = useCallback(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (err) {
      console.error('Error parsing stored user:', err);
      setToken(null);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  
  const logout = async () => {
    const token = getToken();

    try {
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
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
  };

  
  const changePassword = async (currentPassword, newPassword) => {
    const token = getToken();

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Password change failed');
      }

      return { success: true, message: data.message || 'Password changed successfully' };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while changing password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  
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
    setIsAuthenticated: (value) => setUser(value ? user : null),
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
