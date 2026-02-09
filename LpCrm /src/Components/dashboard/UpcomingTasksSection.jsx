import React from 'react';
import { Clock, CheckCircle2, CalendarClock } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';

export default function UpcomingTasksSection({ tasks, formatTaskTime, getPriorityColor }) {
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
                className="group relative flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 hover:shadow-md transition-all duration-200"
              >
                <input 
                  type="checkbox" 
                  checked={task.completed || task.status === 'COMPLETED'}
                  onChange={() => {}}
                  className="w-5 h-5 text-purple-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-400 transition-colors flex-shrink-0" 
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                      {task.title || task.name || 'Untitled Task'}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.priority && (
                        <Badge variant={getPriorityVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      )}
                      {isSoon && (
                        <Badge variant="medium" size="sm" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SOON
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarClock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>{formatTaskTime(task.due_date || task.deadline)}</span>
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