import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// SVG Icons as React components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const InventoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const InvoicesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const StockUpdateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Menu items configuration
const adminMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Inventory', path: '/inventory', icon: InventoryIcon },
  { label: 'Invoices', path: '/invoices', icon: InvoicesIcon },
  { label: 'Users', path: '/users', icon: UsersIcon },
  { label: 'Reports', path: '/reports', icon: ReportsIcon },
];

const employeeMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Inventory', path: '/inventory', icon: InventoryIcon },
  { label: 'Stock Update', path: '/stock-update', icon: StockUpdateIcon },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on mobile, expand on desktop
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile, onClose]);

  // Get menu items based on user role
  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  // Toggle sidebar collapse
  const handleToggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Sidebar classes
  const sidebarClasses = `
    fixed top-0 left-0 h-screen
    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
    text-white
    transition-all duration-300 ease-in-out
    z-40
    shadow-2xl
    ${isMobile ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64')}
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
  `;

  // Overlay for mobile
  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50
    transition-opacity duration-300
    z-30
    ${isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      <div className={overlayClasses} onClick={onClose} />

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">IMS</span>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Inventory
              </h1>
            </div>
          )}

          {/* Close button (mobile) */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          )}

          {/* Collapse button (desktop) */}
          {!isMobile && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors ml-auto"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          )}
        </div>

        {/* User info */}
        {user && (!isCollapsed || isMobile) && (
          <div className="px-4 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User avatar only (collapsed) */}
        {user && isCollapsed && !isMobile && (
          <div className="px-4 py-4 border-b border-slate-700/50 flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                              location.pathname.startsWith(item.path + '/');

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive: routeIsActive }) => `
                      flex items-center space-x-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      group relative overflow-hidden
                      ${routeIsActive || isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}
                    `}
                    title={isCollapsed && !isMobile ? item.label : ''}
                  >
                    {/* Active indicator */}
                    {(isActive) && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}

                    {/* Icon */}
                    <span className={`${isCollapsed && !isMobile ? '' : 'ml-1'} flex-shrink-0`}>
                      <Icon />
                    </span>

                    {/* Label */}
                    {(!isCollapsed || isMobile) && (
                      <span className="font-medium text-sm flex-1 truncate">
                        {item.label}
                      </span>
                    )}

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/50 px-4 py-3">
          {(!isCollapsed || isMobile) ? (
            <div className="text-xs text-slate-400 text-center">
              <p>Inventory Management</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center">
              <p>v1.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// Mobile menu toggle button component
export const MobileMenuButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
};

export default Sidebar;
