import React from 'react';

const LeadsStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">
                  {stat.label}
                </p>
                <h3 className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stat.value.toLocaleString()}
                </h3>
              </div>

              {/* Icon */}
              <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadsStatsCards;