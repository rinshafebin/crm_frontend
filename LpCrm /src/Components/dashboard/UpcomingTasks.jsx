import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';

export default function UpcomingTasks({ tasks, formatTaskTime, getPriorityColor, onViewAll }) {
  const getPriorityVariant = (priority) => {
    const variantMap = {
      'HIGH': 'high',
      'MEDIUM': 'medium',
      'LOW': 'low'
    };
    return variantMap[priority?.toUpperCase()] || 'default';
  };

  return (
    <Card>
      <SectionHeader 
        title="Pending Tasks" 
        onActionClick={onViewAll}
      />
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No pending tasks"
            description="You're all caught up!"
          />
        ) : (
          tasks.slice(0, 5).map((task, index) => (
            <div 
              key={task.id || index} 
              className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <input 
                type="checkbox" 
                checked={task.completed || task.status === 'COMPLETED'}
                onChange={() => {}}
                className="mt-1.5 w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">
                    {task.title || task.name || 'Untitled Task'}
                  </p>
                  {task.priority && (
                    <Badge variant={getPriorityVariant(task.priority)} size="sm">
                      {task.priority.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {formatTaskTime(task.due_date || task.deadline)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}