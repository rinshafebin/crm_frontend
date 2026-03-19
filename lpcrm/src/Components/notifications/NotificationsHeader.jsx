import React from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export default React.memo(({ unreadCount, markAllAsRead, clearAll }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="text-indigo-600" size={32} />
          Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <CheckCheck size={18} />
          Mark All Read
        </button>
        <button 
          onClick={clearAll}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <Trash2 size={18} />
          Clear All
        </button>
      </div>
    </div>
  </div>
));
