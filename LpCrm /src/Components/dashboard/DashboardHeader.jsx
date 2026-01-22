import React from 'react';
import { Clock } from 'lucide-react';
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
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
            <Badge variant={getVariant(userRole)} size="lg">
              {userRole.toUpperCase()}
            </Badge>
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