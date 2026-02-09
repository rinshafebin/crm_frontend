import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Card className="h-full">
      <SectionHeader 
        title="Pending Tasks" 
        onActionClick={onViewAll}
      />
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No pending tasks"
            description="You're all caught up! Great job!"
          />
        ) : (
          tasks.slice(0, 5).map((task, index) => {
            const overdue = isOverdue(task.due_date || task.deadline);
            return (
              <div 
                key={task.id || index} 
                className={`group relative flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 border ${
                  overdue 
                    ? 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm' 
                    : 'border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed || task.status === 'COMPLETED'}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 text-blue-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-400 transition-colors flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className={`text-sm font-semibold ${overdue ? 'text-red-900' : 'text-gray-900'} group-hover:text-blue-700 transition-colors`}>
                      {task.title || task.name || 'Untitled Task'}
                    </p>
                    {task.priority && (
                      <Badge variant={getPriorityVariant(task.priority)} size="sm">
                        {task.priority.toUpperCase()}
                      </Badge>
                    )}
                    {overdue && (
                      <Badge variant="high" size="sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                  <div className={`flex items-center text-xs ${overdue ? 'text-red-700 font-semibold' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
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