import React, { memo } from 'react';

const UpcomingTasks = memo(({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Upcoming Tasks
        </h2>
        <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex flex-wrap items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-gray-900 font-medium text-sm">
                  {task.title}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                {task.date}
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default UpcomingTasks;