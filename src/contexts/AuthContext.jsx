import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthContext = createContext(null);

// Custom hook to use the AuthContext
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

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  // Get token from localStorage
  const getToken = () => localStorage.getItem('authToken');

  // Set token in localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  // Fetch current user from API
  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid or expired
        if (response.status === 401 || response.status === 403) {
          setToken(null);
          setUser(null);
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user || data);
      return data.user || data;
    } catch (err) {
      console.error('Error fetching current user:', err);
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
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

      // Store token and user data
      setToken(data.token);
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

  // Logout function
  const logout = async () => {
    const token = getToken();

    try {
      // Attempt to call logout endpoint (optional, for server-side cleanup)
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
      // Clear local state regardless of API call result
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  // Change password function
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

  // Check for existing token and auto-login on app load
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Handle token expiry - periodically check if token is still valid
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchCurrentUser();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user, fetchCurrentUser]);

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
    refreshUser: fetchCurrentUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
