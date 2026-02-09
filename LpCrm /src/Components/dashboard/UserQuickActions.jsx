import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import MetricCard from '../common/MetricCard';

export default function UserQuickActions({ tasksCount, upcomingCount }) {
  const actions = [
    {
      title: "Pending Tasks",
      value: tasksCount,
      icon: CheckSquare,
      gradient: "from-indigo-500 to-purple-600",
      hoverColor: "indigo"
    },
    {
      title: "Upcoming Tasks",
      value: upcomingCount,
      icon: Clock,
      gradient: "from-orange-500 to-red-600",
      hoverColor: "orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {actions.map((action, index) => (
        <MetricCard key={index} {...action} />
      ))}
    </div>
  );
}