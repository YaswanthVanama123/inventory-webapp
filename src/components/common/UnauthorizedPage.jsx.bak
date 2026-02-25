import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

const UnauthorizedPage = ({ userRole, requiredRoles = [] }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
            <svg
              className="w-16 h-16 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {}
        <div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            403
          </h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h2>
        </div>

        {}
        <div className="space-y-2">
          <p className="text-base text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>

          {userRole && requiredRoles.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">Your role:</span>{' '}
                <span className="capitalize">{userRole}</span>
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                <span className="font-semibold">Required role{requiredRoles.length > 1 ? 's' : ''}:</span>{' '}
                <span className="capitalize">
                  {requiredRoles.join(', ')}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            onClick={handleGoBack}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-2 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </Button>

          <Button
            onClick={handleGoHome}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-2 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Button>

          <Button
            onClick={handleLogout}
            variant="danger"
            className="w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-2 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

UnauthorizedPage.propTypes = {
  userRole: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default UnauthorizedPage;
