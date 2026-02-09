import React from 'react';
import { Calendar, Activity } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import IconContainer from '../common/IconContainer';

export default function RecentActivities({ activities, formatTimeAgo, onViewAll }) {
  return (
    <Card className="h-full">
      <SectionHeader 
        title="Recent Activities" 
        onActionClick={onViewAll}
      />
      
      <div className="space-y-2">
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activities"
            description="Activities will appear here as they happen"
          />
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="group relative flex items-start space-x-3 p-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex-shrink-0">
                <IconContainer 
                  icon={Calendar} 
                  gradient="from-blue-500 to-indigo-600"
                  size="sm"
                  className="group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                  {activity.activity_type || activity.title || 'Activity'}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {activity.user_name || activity.description || 'No description'}
                </p>
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap mt-0.5 group-hover:text-blue-600 transition-colors">
                {formatTimeAgo(activity.created_at || activity.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}