import React from 'react';
import { Bell, AlertCircle, Calendar, CheckCheck } from 'lucide-react';

export default React.memo(({ notifications, unreadCount }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {[
      { label: 'Total', value: notifications.length, icon: Bell, color: 'bg-blue-500' },
      { label: 'Unread', value: unreadCount, icon: AlertCircle, color: 'bg-orange-500' },
      { label: 'Today', value: notifications.filter(n => !n.time.includes('Yesterday')).length, icon: Calendar, color: 'bg-green-500' },
      { label: 'Read', value: notifications.filter(n => n.read).length, icon: CheckCheck, color: 'bg-purple-500' },
    ].map((card, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
          <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
            <card.icon className="text-white" size={20} />
          </div>
        </div>
      </div>
    ))}
  </div>
));
