import React from 'react';
import { CheckSquare, Clock, Calendar, CalendarClock } from 'lucide-react';
import MetricCard from '../common/MetricCard';

export default function UserQuickActions({ tasksCount, upcomingCount, followUpsCount }) {
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const actions = [
    {
      title: 'Today',
      value: getTodayDate(),
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-600',
      hoverColor: 'blue',
      isDate: true,
    },
    {
      title: 'Pending Tasks',
      value: tasksCount,
      icon: CheckSquare,
      gradient: 'from-indigo-500 to-purple-600',
      hoverColor: 'indigo',
    },
    {
      title: 'Upcoming Tasks',
      value: upcomingCount,
      icon: Clock,
      gradient: 'from-orange-500 to-red-600',
      hoverColor: 'orange',
    },
    {
      title: "Today's Follow-Ups",
      value: followUpsCount ?? 0,
      icon: CalendarClock,
      gradient: 'from-emerald-500 to-teal-600',
      hoverColor: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => (
        <MetricCard key={index} {...action} />
      ))}
    </div>
  );
}
