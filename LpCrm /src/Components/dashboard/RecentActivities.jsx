import React, { memo } from 'react';
import { Calendar } from 'lucide-react';
import { Card, Button } from '../ui'

const RecentActivities = memo(({ activities }) => {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Recent Activities
        </h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
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
    </Card>
  );
});

RecentActivities.displayName = 'RecentActivities';
export default RecentActivities;
