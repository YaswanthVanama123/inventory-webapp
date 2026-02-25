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
const FetchHistory = lazy(() => import('./pages/system/FetchHistory'));
const EmployeeWorkDashboard = lazy(() => import('./pages/employee/EmployeeWorkDashboard'));
const TruckCheckoutList = lazy(() => import('./pages/truck-checkout/TruckCheckoutList'));
const TruckCheckoutShop = lazy(() => import('./pages/truck-checkout/TruckCheckoutShop'));
const TruckCheckoutDetail = lazy(() => import('./pages/truck-checkout/TruckCheckoutDetail'));
const EmployeeCheckouts = lazy(() => import('./pages/truck-checkout/EmployeeCheckouts'));
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

                {}
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
                      <ProtectedRoute>
                        <OrdersList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/orders/:orderNumber"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
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

                {}
                <Route
                  path="/system/fetch-history"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <FetchHistory />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {}
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

                {}
                <Route
                  path="/my-work"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <EmployeeWorkDashboard />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {/* Truck Checkouts */}
                <Route
                  path="/truck-checkouts"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <TruckCheckoutList />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/truck-checkouts/new"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <TruckCheckoutShop />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/truck-checkouts/employee/:employeeName"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <EmployeeCheckouts />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/truck-checkouts/:id"
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <TruckCheckoutDetail />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }
                />

                {}
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
