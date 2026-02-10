import React, { useState, useCallback } from 'react';
import Sidebar, { MobileMenuButton } from './Sidebar';


const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleToggleSidebar = useCallback((collapsed) => {
    setIsSidebarCollapsed(collapsed);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <MobileMenuButton
        onClick={handleToggleMobileMenu}
        isOpen={isMobileMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content - Adjust margin based on sidebar state */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <main className="pt-20 md:pt-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
