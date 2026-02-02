import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import UnauthorizedPage from './UnauthorizedPage';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        color="blue"
        text="Checking authentication..."
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles are required, just check authentication
  if (!allowedRoles || allowedRoles.length === 0) {
    return element;
  }

  // Check if user has one of the allowed roles
  const userRole = user?.role?.toLowerCase();
  const hasRequiredRole = allowedRoles.some(
    (role) => role.toLowerCase() === userRole
  );

  // Show unauthorized page if user doesn't have required role
  if (!hasRequiredRole) {
    return <UnauthorizedPage userRole={userRole} requiredRoles={allowedRoles} />;
  }

  // User is authenticated and has required role
  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
