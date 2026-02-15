import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';


const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);


const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/EnhancedDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const InventoryList = lazy(() => import('./pages/inventory/InventoryList'));
const InventoryForm = lazy(() => import('./pages/inventory/InventoryForm'));
const InventoryDetail = lazy(() => import('./pages/inventory/InventoryDetail'));
const Stock = lazy(() => import('./pages/inventory/Stock'));
const OrdersList = lazy(() => import('./pages/orders/OrdersList'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const PendingInvoices = lazy(() => import('./pages/routestar/PendingInvoices'));
const ClosedInvoices = lazy(() => import('./pages/routestar/ClosedInvoices'));
const RouteStarInvoiceDetail = lazy(() => import('./pages/routestar/RouteStarInvoiceDetail'));
const ModelCategoryMapping = lazy(() => import('./pages/routestar/ModelCategoryMapping'));
const ItemNameAliasMapping = lazy(() => import('./pages/routestar/ItemNameAliasMapping'));
const RouteStarItemsList = lazy(() => import('./pages/routestar/RouteStarItemsList'));
const RouteStarSalesReport = lazy(() => import('./pages/routestar/SalesReport'));
const PointOfSale = lazy(() => import('./pages/pos/PointOfSale'));
const Categories = lazy(() => import('./pages/categories/Categories'));
const Units = lazy(() => import('./pages/units/Units'));
const CouponsAndPayments = lazy(() => import('./pages/coupons/CouponsAndPayments'));
const InvoiceList = lazy(() => import('./pages/invoices/InvoiceList'));
const InvoiceForm = lazy(() => import('./pages/invoices/InvoiceForm'));
const InvoiceDetail = lazy(() => import('./pages/invoices/InvoiceDetail'));
const Approvals = lazy(() => import('./pages/approvals/Approvals'));
const UserList = lazy(() => import('./pages/admin/UserList'));
const UserForm = lazy(() => import('./pages/admin/UserForm'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const SalesReport = lazy(() => import('./pages/reports/SalesReport'));
const ToastDemo = lazy(() => import('./pages/ToastDemo'));
const ErrorBoundaryDemo = lazy(() => import('./pages/ErrorBoundaryDemo'));
const LowStockReport = lazy(() => import('./pages/reports/LowStockReport'));
const UserProfile = lazy(() => import('./pages/profile/UserProfile'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Trash = lazy(() => import('./pages/trash/Trash'));
const EmployeeActivities = lazy(() => import('./pages/activities/EmployeeActivities'));
const NotFound = lazy(() => import('./pages/NotFound'));


const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = React.useContext(AuthContext);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

/**
 * Dashboard Route Component
 * Renders different dashboards based on user role
 */
const DashboardRoute = () => {
  const { isAdmin, loading } = React.useContext(AuthContext);

  if (loading) {
    return <LoadingFallback />;
  }

  
  if (isAdmin) {
    return <AdminDashboard />;
  } else {
    return <EmployeeDashboard />;
  }
};


const RootRoute = () => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {}
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <RootRoute />
                    </ErrorBoundary>
                  }
                />

                {}
                <Route
                  path="/login"
                  element={
                    <ErrorBoundary>
                      <Login />
                    </ErrorBoundary>
                  }
                />

                {}
                <Route
                  path="/dashboard"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <DashboardRoute />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Inventory (all authenticated users) */}
                <Route
                  path="/inventory"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <InventoryList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/stock"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <Stock />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <OrdersList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/orders/:orderNumber"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <OrderDetail />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/inventory/new"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <InventoryForm />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/inventory/:id"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <InventoryDetail />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/inventory/:id/edit"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <InventoryForm />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Point of Sale (all authenticated users) */}
                <Route
                  path="/pos"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <PointOfSale />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Categories (Admin only) */}
                <Route
                  path="/categories"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Categories />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Units (Admin only) */}
                <Route
                  path="/units"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Units />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Coupons & Payments (Admin only) */}
                <Route
                  path="/coupons"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <CouponsAndPayments />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Invoices (Admin only) */}
                <Route
                  path="/invoices"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <InvoiceList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/invoices/new"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <InvoiceForm />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/invoices/:id"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <InvoiceDetail />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/invoices/routestar/pending"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <PendingInvoices />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/invoices/routestar/closed"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <ClosedInvoices />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/invoices/routestar/:invoiceNumber"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <RouteStarInvoiceDetail />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Model Mapping (Admin only) */}
                <Route
                  path="/routestar/model-mapping"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <ModelCategoryMapping />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Item Name Alias Mapping (Admin only) */}
                <Route
                  path="/routestar/item-alias-mapping"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <ItemNameAliasMapping />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - RouteStar Items List (Admin only) */}
                <Route
                  path="/routestar/items"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <RouteStarItemsList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - RouteStar Sales Report (Admin only) */}
                <Route
                  path="/routestar/sales-report"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <RouteStarSalesReport />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Approvals (Admin only) */}
                <Route
                  path="/approvals"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Approvals />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Users (Admin only) */}
                <Route
                  path="/users"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <UserList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/users/new"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <UserForm />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/users/:id/edit"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <UserForm />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Reports (Admin only) */}
                <Route
                  path="/reports"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Reports />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/reports/sales"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <SalesReport />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/reports/low-stock"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <LowStockReport />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Settings (Admin only) */}
                <Route
                  path="/settings"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Settings />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Toast Demo */}
                <Route
                  path="/toast-demo"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ToastDemo />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Error Boundary Demo */}
                <Route
                  path="/error-boundary-demo"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ErrorBoundaryDemo />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Trash (Admin only) */}
                <Route
                  path="/trash"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <Trash />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Employee Activities (Admin only) */}
                <Route
                  path="/activities"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAdmin>
                        <EmployeeActivities />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Profile (all authenticated users) */}
                <Route
                  path="/profile"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* 404 Not Found */}
                <Route
                  path="*"
                  element={
                    <ErrorBoundary>
                      <NotFound />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
