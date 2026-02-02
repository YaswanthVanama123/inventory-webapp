import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  EllipsisHorizontalCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';




const getNavItems = (isAdmin) => {
  const baseItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
      showFor: ['admin', 'employee'],
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: CubeIcon,
      showFor: ['admin', 'employee'],
    },
  ];

  const adminItem = {
    label: 'Invoices',
    path: '/invoices',
    icon: DocumentTextIcon,
    showFor: ['admin'],
  };

  
  if (isAdmin) {
    return [...baseItems, adminItem];
  }

  return baseItems;
};


const getMoreMenuItems = (isAdmin) => {
  const adminItems = [
    { label: 'Users', path: '/users' },
    { label: 'Reports', path: '/reports' },
    { label: 'Invoices', path: '/invoices' },
  ];

  const employeeItems = [
    { label: 'Stock Update', path: '/stock-update' },
  ];

  return isAdmin ? adminItems : employeeItems;
};

const MobileNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const navItems = getNavItems(isAdmin);
  const moreMenuItems = getMoreMenuItems(isAdmin);

  
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  
  const isMoreMenuActive = moreMenuItems.some(item => isActiveRoute(item.path));

  
  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  
  const handleMoreMenuItemClick = () => {
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleMoreMenu}
          aria-hidden="true"
        />
      )}

      {}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white rounded-t-3xl shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isMoreMenuOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">More Options</h3>
          <button
            onClick={toggleMoreMenu}
            className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {}
        <nav className="px-4 py-4 pb-6">
          <ul className="space-y-1">
            {moreMenuItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={handleMoreMenuItemClick}
                    className={`
                      block px-4 py-3 rounded-xl font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                      }
                    `}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-slate-200 shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {/* Dynamic Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center
                  min-w-0 flex-1 px-3 py-2 rounded-xl
                  transition-all duration-200 ease-out
                  group relative
                  ${isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 active:text-slate-900'
                  }
                `}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}

                {/* Icon with scale animation */}
                <div
                  className={`
                    transition-all duration-200
                    ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105 group-active:scale-95'}
                  `}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`}
                    aria-hidden="true"
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-1 text-xs font-medium truncate w-full text-center
                    transition-all duration-200
                    ${isActive ? 'font-semibold' : 'font-normal'}
                  `}
                >
                  {item.label}
                </span>

                {/* Background highlight on active */}
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50 rounded-xl -z-10 scale-95" />
                )}
              </NavLink>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={toggleMoreMenu}
            className={`
              flex flex-col items-center justify-center
              min-w-0 flex-1 px-3 py-2 rounded-xl
              transition-all duration-200 ease-out
              group relative
              ${isMoreMenuActive || isMoreMenuOpen
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-700 active:text-slate-900'
              }
            `}
            aria-label="More options"
            aria-expanded={isMoreMenuOpen}
          >
            {/* Active indicator dot */}
            {isMoreMenuActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}

            {/* Icon with scale and rotation animation */}
            <div
              className={`
                transition-all duration-200
                ${isMoreMenuOpen ? 'scale-110 rotate-90' : 'scale-100 group-hover:scale-105 group-active:scale-95'}
              `}
            >
              {isMoreMenuOpen ? (
                <Bars3Icon
                  className={`w-6 h-6 ${isMoreMenuActive ? 'stroke-2' : 'stroke-[1.5]'}`}
                  aria-hidden="true"
                />
              ) : (
                <EllipsisHorizontalCircleIcon
                  className={`w-6 h-6 ${isMoreMenuActive ? 'stroke-2' : 'stroke-[1.5]'}`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`
                mt-1 text-xs font-medium truncate w-full text-center
                transition-all duration-200
                ${isMoreMenuActive || isMoreMenuOpen ? 'font-semibold' : 'font-normal'}
              `}
            >
              More
            </span>

            {/* Background highlight on active */}
            {(isMoreMenuActive || isMoreMenuOpen) && (
              <div className="absolute inset-0 bg-blue-50 rounded-xl -z-10 scale-95" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
