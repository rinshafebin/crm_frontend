// Components/common/MetricCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient, 
  hoverColor,
  showTrend = false 
}) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">
            {title}
          </p>
          <h3 className={`text-4xl font-bold text-gray-900 transition-colors ${
            hoverColor === 'blue' ? 'group-hover:text-blue-600' :
            hoverColor === 'green' ? 'group-hover:text-green-600' :
            hoverColor === 'purple' ? 'group-hover:text-purple-600' :
            hoverColor === 'indigo' ? 'group-hover:text-indigo-600' :
            'group-hover:text-blue-600'
          }`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          
          {showTrend && change !== undefined && (
            <div className={`flex items-center text-sm font-medium mt-3 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1.5" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1.5" />
              )}
              <span className="font-bold">{change >= 0 ? '+' : ''}{change}%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}