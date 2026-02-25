import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import UnauthorizedPage from './UnauthorizedPage';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  
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

  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  if (!allowedRoles || allowedRoles.length === 0) {
    return element;
  }

  
  const userRole = user?.role?.toLowerCase();
  const hasRequiredRole = allowedRoles.some(
    (role) => role.toLowerCase() === userRole
  );

  
  if (!hasRequiredRole) {
    return <UnauthorizedPage userRole={userRole} requiredRoles={allowedRoles} />;
  }

  
  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
