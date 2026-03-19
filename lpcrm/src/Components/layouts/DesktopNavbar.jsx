import React from 'react';
import { LogOut, MessageSquare } from 'lucide-react';

const DesktopNavbar = ({
  navItems,
  isActive,
  handleNavigation,
  handleLogout,
  notificationCount,
  onChatOpen,
}) => {
  return (
    <div className="hidden lg:flex items-center justify-between gap-4 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
      {/* Navigation Items */}
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm
                transition-all duration-200
                ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }
              `}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Chat Button */}
        <button
          onClick={onChatOpen}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-medium text-sm transition-all duration-200"
        >
          <MessageSquare size={18} />
          <span>Chat</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md font-medium text-sm transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DesktopNavbar;
