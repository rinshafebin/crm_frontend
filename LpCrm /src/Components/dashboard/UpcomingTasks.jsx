import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function UpcomingTasks({ tasks, formatTaskTime, getPriorityColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Tasks</h2>
        <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors">
          View All →
        </button>
      </div>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No upcoming tasks</p>
            <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
          </div>
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
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
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
    </div>
  );
}