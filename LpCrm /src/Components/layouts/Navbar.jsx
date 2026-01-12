import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuForRole } from '../../config/roles';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const navItems = getMenuForRole(user?.role);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto">
        <DesktopNavbar
          navItems={navItems}
          isActive={isActive}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
          notificationCount={notificationCount}
        />
        
        <MobileNavbar
          navItems={navItems}
          isActive={isActive}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
          notificationCount={notificationCount}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>
    </div>
  );
};

export default Navbar;