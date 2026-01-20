import React from 'react';

export default function QuickActionCard({ title, value, icon: Icon, gradient, hoverColor }) {
  return (
    <div className={`group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-${hoverColor}-200 transition-all cursor-pointer`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}