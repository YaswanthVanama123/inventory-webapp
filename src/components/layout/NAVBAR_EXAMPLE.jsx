

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Navbar from './Navbar';


const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p>Welcome to your dashboard</p>
  </div>
);

const Users = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Users Management</h1>
    <p>Manage system users (Admin only)</p>
  </div>
);

const Reports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Reports</h1>
    <p>View and generate reports</p>
  </div>
);

const Analytics = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Analytics</h1>
    <p>System analytics and insights (Admin only)</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Settings</h1>
    <p>Configure system settings</p>
  </div>
);

const Profile = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Profile</h1>
    <p>Manage your profile</p>
  </div>
);

const Tasks = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">My Tasks</h1>
    <p>View and manage your assigned tasks</p>
  </div>
);

const SearchResults = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const query = queryParams.get('q');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Search Results</h1>
      <p>Results for: "{query}"</p>
    </div>
  );
};

const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <h2 className="text-3xl font-bold text-center">Sign In</h2>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
);


function AppWithNavbar() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {}
          <Navbar />

          {}
          <main className="pt-16">
            <Routes>
              {}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Admin Routes */}
              <Route path="/users" element={<Users />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Shared Routes */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />

              {/* Employee Routes */}
              <Route path="/tasks" element={<Tasks />} />

              {/* Search */}
              <Route path="/search" element={<SearchResults />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 Not Found */}
              <Route
                path="*"
                element={
                  <div className="p-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

/**
 * Alternative: With Protected Routes
 */
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

function AppWithProtectedRoutes() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <main className="pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - All authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requireAdmin>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />

              {/* Search */}
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchResults />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="p-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

/**
 * Alternative: With Container/Max Width
 */
function AppWithContainer() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          {/* Container with max-width for content */}
          <main className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Export the desired version
export default AppWithNavbar;

// Named exports for different implementations
export { AppWithProtectedRoutes, AppWithContainer };
