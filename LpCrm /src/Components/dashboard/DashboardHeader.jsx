import React from 'react';
import { Clock } from 'lucide-react';

export default function DashboardHeader({ userName, userRole, isAdmin }) {
  const getRoleBadgeColor = (role) => {
    const roleUpper = role?.toUpperCase() || 'USER';
    switch (roleUpper) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case 'MANAGER':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'STAFF':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-slate-600 text-white';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg ${getRoleBadgeColor(userRole)}`}>
              {userRole.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 text-lg">
            {getGreeting()}, <span className="font-semibold text-gray-800">{userName}</span>! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
