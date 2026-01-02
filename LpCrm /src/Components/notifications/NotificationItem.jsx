import React from 'react';

export default React.memo(({ notification, markAsRead, deleteNotification }) => {
  const Icon = notification.icon;
  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 ${
        !notification.read ? 'border-l-4 border-indigo-600' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`${notification.color} p-3 rounded-lg flex-shrink-0`}>
          <Icon className="text-white" size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {notification.title}
              {!notification.read && (
                <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">{notification.time}</span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
          
          <div className="flex gap-2">
            {!notification.read && (
              <button 
                onClick={() => markAsRead(notification.id)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mark as read
              </button>
            )}
            <button 
              onClick={() => deleteNotification(notification.id)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
