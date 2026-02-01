import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 *
 * @returns {Object} Authentication context value containing:
 *   - user: Current user object (null if not authenticated)
 *   - loading: Boolean indicating if auth operation is in progress
 *   - error: Error message if any
 *   - isAuthenticated: Boolean indicating if user is logged in
 *   - isAdmin: Boolean indicating if user has admin role
 *   - isEmployee: Boolean indicating if user has employee role
 *   - login: Function to log in (username, password)
 *   - logout: Function to log out
 *   - changePassword: Function to change password (currentPassword, newPassword)
 *   - refreshUser: Function to refresh current user data
 *   - setError: Function to set error message
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
 *
 * // Login
 * const handleLogin = async () => {
 *   const result = await login('username', 'password');
 *   if (result.success) {
 *     console.log('Logged in as:', result.user.username);
 *   } else {
 *     console.error('Login failed:', result.error);
 *   }
 * };
 *
 * // Logout
 * const handleLogout = async () => {
 *   await logout();
 * };
 *
 * // Change password
 * const handleChangePassword = async () => {
 *   const result = await changePassword('oldPass', 'newPass');
 *   if (result.success) {
 *     console.log('Password changed');
 *   } else {
 *     console.error('Error:', result.error);
 *   }
 * };
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
