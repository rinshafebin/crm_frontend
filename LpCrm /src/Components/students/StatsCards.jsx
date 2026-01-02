import React from 'react';
import { GraduationCap, UserCheck, CheckCircle, UserX } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '1,847', color: 'bg-blue-500', icon: GraduationCap },
  { label: 'Active Students', value: '1,654', color: 'bg-green-500', icon: UserCheck },
  { label: 'Completed', value: '156', color: 'bg-purple-500', icon: CheckCircle },
  { label: 'Inactive', value: '37', color: 'bg-red-500', icon: UserX }
];

const StatCard = React.memo(({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
        </div>
        <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <IconComponent className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}