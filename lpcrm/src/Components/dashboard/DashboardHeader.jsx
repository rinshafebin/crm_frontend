import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export default function DashboardHeader({ userName, userRole, isAdmin }) {
  const getVariant = (role) => {
    const roleMap = {
      'ADMIN': 'admin',
      'MANAGER': 'manager',
      'STAFF': 'staff'
    };
    return roleMap[role?.toUpperCase()] || 'default';
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
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
            <Badge variant={getVariant(userRole)} size="lg" className="animate-pulse">
              {userRole.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <p className="text-gray-600 text-lg">
              {getGreeting()}, <span className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{userName}</span>! Here's your overview.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}