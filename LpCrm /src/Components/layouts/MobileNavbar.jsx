import React from 'react';
import {  LogOut, Menu, X } from 'lucide-react';

const MobileNavbar = ({ navItems, isActive, handleNavigation, handleLogout, notificationCount, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm
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
        </div>
      )}
    </div>
  );
};

export default MobileNavbar;