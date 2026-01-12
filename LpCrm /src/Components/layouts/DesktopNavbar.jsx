import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

const DesktopNavbar = ({ navItems, isActive, handleNavigation, handleLogout, notificationCount }) => {
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
                ${active 
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
      <div className="flex items-center gap-3">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white text-gray-700 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-64 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Notification Icon */}
        <button 
          onClick={() => handleNavigation('/notifications')}
          className="relative p-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all duration-200"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
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