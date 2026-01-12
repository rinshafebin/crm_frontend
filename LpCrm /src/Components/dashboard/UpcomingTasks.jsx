import React, { memo } from 'react';
import { Card, Button, Badge } from '../ui';

const UpcomingTasks = memo(({ tasks }) => {
  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Upcoming Tasks
        </h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex flex-wrap items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-gray-900 font-medium text-sm">
                  {task.title}
                </p>
                <Badge 
                  variant={getPriorityVariant(task.priority)}
                  size="sm"
                >
                  {task.priority}
                </Badge>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                {task.date}
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        ))}
      </div>
    </Card>
  );
});

UpcomingTasks.displayName = 'UpcomingTasks';
export default UpcomingTasks;