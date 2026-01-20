import React from 'react';
import { Calendar } from 'lucide-react';

export default function RecentActivities({ activities, formatTimeAgo }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
        <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors">
          View All →
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No recent activities</p>
            <p className="text-gray-400 text-xs mt-1">Activities will appear here as they happen</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
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
    </div>
  );
}