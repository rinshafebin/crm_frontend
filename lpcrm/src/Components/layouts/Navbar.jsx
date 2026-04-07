import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuForRole } from '../../config/roles';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import { useUserChannel } from '../../hooks/useUserChannel';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 20)); // keep last 20
    setUnreadCount(prev => prev + 1);
  };

  useUserChannel({
    onTaskAssigned: (data) => addNotification({
      id: Date.now(),
      type: 'task',
      message: `New task assigned: "${data.title}"`,
      by: data.assigned_by_name,
      time: new Date(),
    }),
    onLeadAssigned: (data) => addNotification({
      id: Date.now(),
      type: 'lead',
      message: `Lead assigned: ${data.lead_name}`,
      by: data.assigned_by_name,
      time: new Date(),
    }),
    onNewConversation: (data) => addNotification({
      id: Date.now(),
      type: 'chat',
      message: data.type === 'GROUP'
        ? `Added to group: "${data.name}"`
        : 'New direct message conversation',
      time: new Date(),
    }),
  });

  const navItems = getMenuForRole(user?.role);

  const handleNavigation = (path) => { navigate(path); setIsMobileMenuOpen(false); };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const handleChatOpen = () => { navigate('/chat'); setIsMobileMenuOpen(false); };
  const isActive = (path) => location.pathname === path;
  const handleClearNotifications = () => { setNotifications([]); setUnreadCount(0); };

  return (
    <div className="bg-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto">
        <DesktopNavbar
          navItems={navItems}
          isActive={isActive}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
          onChatOpen={handleChatOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          onClearNotifications={handleClearNotifications}
          onMarkRead={() => setUnreadCount(0)}
        />
        <MobileNavbar
          navItems={navItems}
          isActive={isActive}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onChatOpen={handleChatOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          onClearNotifications={handleClearNotifications}
          onMarkRead={() => setUnreadCount(0)}
        />
      </div>
    </div>
  );
};

export default Navbar;
