import React, { useState, useCallback } from 'react';
import Sidebar, { MobileMenuButton } from './Sidebar';


const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {}
      <MobileMenuButton
        onClick={handleToggleMobileMenu}
        isOpen={isMobileMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      {}
      <div className="md:ml-64 transition-all duration-300">
        <main className="pt-20 md:pt-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
