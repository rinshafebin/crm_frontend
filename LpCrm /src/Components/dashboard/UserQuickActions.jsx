import React from 'react';
import { CheckSquare, FileText, Calendar } from 'lucide-react';
import QuickActionCard from './QuickActionCard';

export default function UserQuickActions({ tasksCount, activitiesCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <QuickActionCard
        title="My Tasks"
        value={tasksCount}
        icon={CheckSquare}
        gradient="from-indigo-500 to-purple-600"
        hoverColor="indigo"
      />
      <QuickActionCard
        title="Recent Activities"
        value={activitiesCount}
        icon={FileText}
        gradient="from-blue-500 to-cyan-600"
        hoverColor="blue"
      />
      <QuickActionCard
        title="Today"
        value={new Date().getDate()}
        icon={Calendar}
        gradient="from-green-500 to-emerald-600"
        hoverColor="green"
      />
    </div>
  );
}