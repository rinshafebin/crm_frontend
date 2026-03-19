import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';

export default function UpcomingTasks({ tasks, formatTaskTime, getPriorityColor }) {
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
                className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border ${
                  overdue 
                    ? 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md' 
                    : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed || task.status === 'COMPLETED'}
                  onChange={() => {}}
                  className="w-5 h-5 text-blue-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-400 transition-colors flex-shrink-0" 
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${overdue ? 'text-red-900' : 'text-gray-900'} group-hover:text-blue-700 transition-colors truncate`}>
                      {task.title || task.name || 'Untitled Task'}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.priority && (
                        <Badge variant={getPriorityVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      )}
                      {overdue && (
                        <Badge variant="high" size="sm" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center text-xs ${overdue ? 'text-red-700 font-medium' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
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