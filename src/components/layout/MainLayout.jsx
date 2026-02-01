import React, { useState } from 'react';
import Sidebar, { MobileMenuButton } from './Sidebar';

/**
 * MainLayout component
 * Wraps pages with the sidebar navigation
 * Handles mobile menu state
 */
const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu toggle button */}
      <MobileMenuButton
        onClick={handleToggleMobileMenu}
        isOpen={isMobileMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      {/* Main content area */}
      <div className="md:ml-64 transition-all duration-300">
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
