import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';


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

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CubeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);


const adminMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: InventoryIcon,
    submenu: [
      { label: 'View All', path: '/inventory', icon: ListIcon },
      { label: 'Add New Item', path: '/inventory/new', icon: AddIcon },
    ]
  },
  {
    label: 'Point of Sale',
    path: '/pos',
    icon: ShoppingCartIcon
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: TagIcon
  },
  {
    label: 'Units',
    path: '/units',
    icon: CubeIcon
  },
  {
    label: 'Coupons & Payments',
    path: '/coupons',
    icon: TagIcon
  },
  {
    label: 'Stock',
    path: '/stock',
    icon: PackageIcon
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ClipboardListIcon
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: InvoicesIcon,
    submenu: [
      { label: 'View All', path: '/invoices', icon: ListIcon },
      { label: 'Create New', path: '/invoices/new', icon: AddIcon },
      { label: 'Pending (RouteStar)', path: '/invoices/routestar/pending', icon: ListIcon },
      { label: 'Closed (RouteStar)', path: '/invoices/routestar/closed', icon: ListIcon },
    ]
  },
  {
    label: 'Model Mapping',
    path: '/routestar/model-mapping',
    icon: LinkIcon
  },
  {
    label: 'RouteStar Items',
    path: '/routestar/items',
    icon: PackageIcon
  },
  {
    label: 'Sales Report',
    path: '/routestar/sales-report',
    icon: ChartIcon
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: CheckCircleIcon
  },
  {
    label: 'Users',
    path: '/users',
    icon: UsersIcon,
    submenu: [
      { label: 'View All', path: '/users', icon: ListIcon },
      { label: 'Add New User', path: '/users/new', icon: AddIcon },
    ]
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ReportsIcon,
    submenu: [
      { label: 'Overview', path: '/reports', icon: ChartIcon },
      { label: 'Sales Report', path: '/reports/sales', icon: ChartIcon },
      { label: 'Low Stock', path: '/reports/low-stock', icon: WarningIcon },
    ]
  },
  {
    label: 'Employee Activities',
    path: '/activities',
    icon: ActivityIcon
  },
  {
    label: 'Trash',
    path: '/trash',
    icon: TrashIcon
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: ProfileIcon
  },
];

const employeeMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: InventoryIcon,
    submenu: [
      { label: 'View All', path: '/inventory', icon: ListIcon },
    ]
  },
  {
    label: 'Point of Sale',
    path: '/pos',
    icon: ShoppingCartIcon
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: ProfileIcon
  },
];

const Sidebar = ({ isOpen, onClose, onToggleCollapse }) => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const toggleSubmenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  
  useEffect(() => {
    const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isOnSubPage = item.submenu.some((subItem) => {
          const subItemPath = subItem.path.split('?')[0];
          return location.pathname === subItemPath ||
                 (location.pathname.startsWith(subItemPath + '/') && subItemPath !== '/');
        });
        if (isOnSubPage) {
          setExpandedMenus((prev) => ({
            ...prev,
            [item.label]: true,
          }));
        }
      }
    });
  }, [location.pathname, isAdmin]);


  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);


      if (mobile && isCollapsed) {
        setIsCollapsed(false);
        
        if (onToggleCollapse) {
          onToggleCollapse(false);
        }
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isCollapsed, onToggleCollapse]);

  
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile, onClose]);

  
  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;


  const handleToggleCollapse = () => {
    if (!isMobile) {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      
      if (onToggleCollapse) {
        onToggleCollapse(newCollapsedState);
      }
    }
  };

  
  const sidebarClasses = `
    fixed top-0 left-0 h-screen
    flex flex-col
    bg-white dark:bg-gray-800
    border-r border-slate-200 dark:border-gray-700
    transition-all duration-300 ease-in-out
    z-40
    shadow-lg
    ${isMobile ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64')}
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
  `;

  
  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50
    transition-opacity duration-300
    z-30
    ${isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {}
      <div className={overlayClasses} onClick={onClose} />

      {}
      <aside className={sidebarClasses}>
        {}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-gray-700">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IMS</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Inventory
              </h1>
            </div>
          )}

          {}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-600 dark:text-gray-300"
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          )}

          {}
          {!isMobile && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors ml-auto text-slate-600 dark:text-gray-300"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          )}
        </div>

        {}
        {user && (!isCollapsed || isMobile) && (
          <div className="px-4 py-4 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {}
        {user && isCollapsed && !isMobile && (
          <div className="px-4 py-4 border-b border-slate-200 dark:border-gray-700 flex justify-center">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}

        {}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.label];

              
              const currentPathOnly = location.pathname;

              
              let isActive = false;

              
              if (hasSubmenu) {
                const hasActiveSubmenu = item.submenu.some(sub => {
                  const subPath = sub.path.split('?')[0];
                  return currentPathOnly === subPath ||
                         (currentPathOnly.startsWith(subPath + '/') && subPath !== '/');
                });
                isActive = hasActiveSubmenu;
              } else {
                
                isActive = currentPathOnly === item.path;
              }

              return (
                <li key={item.label + '-' + item.path}>
                  {}
                  {hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                          transition-colors duration-200
                          ${isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-700'
                          }
                          ${isCollapsed && !isMobile ? 'justify-center' : ''}
                        `}
                        title={isCollapsed && !isMobile ? item.label : ''}
                      >
                        {}
                        <span className={`${isCollapsed && !isMobile ? '' : 'ml-1'} flex-shrink-0`}>
                          <Icon />
                        </span>

                        {}
                        {(!isCollapsed || isMobile) && (
                          <>
                            <span className="font-medium text-sm flex-1 truncate text-left">
                              {item.label}
                            </span>
                            <span className="flex-shrink-0">
                              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </span>
                          </>
                        )}
                      </button>

                      {}
                      {(!isCollapsed || isMobile) && isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.submenu.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const subItemPath = subItem.path.split('?')[0];

                            
                            const isSubActive = location.pathname === subItemPath ||
                                               (location.pathname.startsWith(subItemPath + '/') && subItemPath !== '/');

                            return (
                              <li key={subItem.label + '-' + subItem.path}>
                                <NavLink
                                  to={subItem.path}
                                  className={`
                                    flex items-center space-x-2 px-3 py-2 rounded-lg
                                    transition-colors duration-200
                                    ${isSubActive
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                                    }
                                  `}
                                >
                                  <span className="flex-shrink-0">
                                    <SubIcon />
                                  </span>
                                  <span className="text-sm truncate">
                                    {subItem.label}
                                  </span>
                                </NavLink>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive: routeIsActive }) => `
                        flex items-center space-x-3 px-3 py-3 rounded-lg
                        transition-colors duration-200
                        ${routeIsActive || isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-700'
                        }
                        ${isCollapsed && !isMobile ? 'justify-center' : ''}
                      `}
                      title={isCollapsed && !isMobile ? item.label : ''}
                    >
                      {}
                      <span className={`${isCollapsed && !isMobile ? '' : 'ml-1'} flex-shrink-0`}>
                        <Icon />
                      </span>

                      {}
                      {(!isCollapsed || isMobile) && (
                        <span className="font-medium text-sm flex-1 truncate">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {}
        <div className="border-t border-slate-200 dark:border-gray-700 p-4">
          {(!isCollapsed || isMobile) ? (
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <LogOutIcon />
                <span className="font-medium text-sm">Logout</span>
              </button>
              <div className="text-xs text-slate-500 dark:text-gray-400 text-center">
                <p>Inventory Management v1.0.0</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOutIcon />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};


export const MobileMenuButton = ({ onClick, isOpen }) => {
  
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-[60] p-3 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-all border border-slate-300 dark:border-gray-600 hover:scale-105 active:scale-95"
      aria-label="Open menu"
    >
      <MenuIcon />
    </button>
  );
};

export default Sidebar;
