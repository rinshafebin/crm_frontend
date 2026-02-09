import React from 'react';
import { Clock, CheckCircle2, CalendarClock } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';

export default function UpcomingTasksSection({ tasks, formatTaskTime, getPriorityColor, onViewAll }) {
  const getPriorityVariant = (priority) => {
    const variantMap = {
      'HIGH': 'high',
      'MEDIUM': 'medium',
      'LOW': 'low'
    };
    return variantMap[priority?.toUpperCase()] || 'default';
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="h-full">
      <SectionHeader 
        title="Upcoming Tasks" 
        onActionClick={onViewAll}
      />
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming tasks"
            description="Your schedule is clear ahead!"
          />
        ) : (
          tasks.slice(0, 5).map((task, index) => {
            const daysUntil = getDaysUntilDue(task.due_date || task.deadline);
            const isSoon = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;
            
            return (
              <div 
                key={task.id || index} 
                className={`group relative flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 border ${
                  isSoon 
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-sm' 
                    : 'border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed || task.status === 'COMPLETED'}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 text-orange-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 cursor-pointer hover:border-orange-400 transition-colors flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className={`text-sm font-semibold ${isSoon ? 'text-amber-900' : 'text-gray-900'} group-hover:text-orange-700 transition-colors`}>
                      {task.title || task.name || 'Untitled Task'}
                    </p>
                    {task.priority && (
                      <Badge variant={getPriorityVariant(task.priority)} size="sm">
                        {task.priority.toUpperCase()}
                      </Badge>
                    )}
                    {isSoon && (
                      <Badge variant="medium" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        SOON
                      </Badge>
                    )}
                  </div>
                  <div className={`flex items-center text-xs ${isSoon ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>
                    <CalendarClock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{formatTaskTime(task.due_date || task.deadline)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}