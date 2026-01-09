import React, { memo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = memo(({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
            {value}
          </h3>

          <div className="flex items-center mt-2 gap-1">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-xs sm:text-sm font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm">
              vs last month
            </span>
          </div>
        </div>

        <div className={`${color} p-3 lg:p-4 rounded-lg`}>
          <Icon className="text-white w-6 h-6 lg:w-7 lg:h-7" />
        </div>
      </div>
    </div>
  );
});

export default StatCard;