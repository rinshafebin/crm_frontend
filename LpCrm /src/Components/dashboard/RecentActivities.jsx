import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import IconContainer from '../common/IconContainer';

export default function RecentActivities({ activities, formatTimeAgo, onViewAll }) {
  return (
    <Card>
      <SectionHeader 
        title="Recent Activities" 
        onActionClick={onViewAll}
      />
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No recent activities"
            description="Activities will appear here as they happen"
          />
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
            >
              <IconContainer 
                icon={Calendar} 
                gradient="from-blue-500 to-indigo-600"
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {activity.activity_type || activity.title || 'Activity'}
                </p>
                <p className="text-sm text-gray-600">
                  {activity.user_name || activity.description || 'No description'}
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap mt-1">
                {formatTimeAgo(activity.created_at || activity.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
