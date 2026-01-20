import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, icon: Icon, gradient, hoverColor }) {
  return (
    <div className={`group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-${hoverColor}-200 transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase">{title}</p>
          </div>
          <h3 className={`text-5xl font-bold text-gray-900 mb-4 group-hover:text-${hoverColor}-600 transition-colors`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1.5" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1.5" />
            )}
            <span className="font-bold text-base">{change >= 0 ? '+' : ''}{change}%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
