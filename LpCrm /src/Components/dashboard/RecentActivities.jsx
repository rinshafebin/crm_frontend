import React, { memo } from 'react';
import { Calendar } from 'lucide-react';

const RecentActivities = memo(({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Recent Activities
        </h2>
        <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex flex-wrap items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
          >
            <div className="bg-indigo-100 rounded-full p-2">
              <Calendar className="text-indigo-600 w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">
                {activity.action}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {activity.user}
              </p>
            </div>
            <span className="text-gray-500 text-xs whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RecentActivities;