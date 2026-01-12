import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';


const StatCard = ({ 
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-indigo-500',
  iconColor = 'text-white',
  trend,
  trendValue,
  trendLabel,
  onClick,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };
  
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow p-6 
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
      
      {(trend || trendValue || trendLabel) && (
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          {trend && (
            <span className={`flex items-center ${getTrendColor()} mr-2`}>
              {getTrendIcon()}
            </span>
          )}
          {trendValue && (
            <span className={`text-sm font-medium ${getTrendColor()} mr-1`}>
              {trendValue}
            </span>
          )}
          {trendLabel && (
            <span className="text-sm text-gray-600">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;