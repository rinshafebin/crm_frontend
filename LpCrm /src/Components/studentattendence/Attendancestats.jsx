import React from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import MetricCard from '../common/MetricCard'

export default function AttendanceStats({ totalStudents, statusCounts }) {
  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      hoverColor: 'blue'
    },
    {
      title: 'Present',
      value: statusCounts.PRESENT,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      hoverColor: 'green'
    },
    {
      title: 'Absent',
      value: statusCounts.ABSENT,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      hoverColor: 'red'
    },
    {
      title: 'Late',
      value: statusCounts.LATE,
      icon: Clock,
      gradient: 'from-yellow-500 to-yellow-600',
      hoverColor: 'yellow'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          gradient={stat.gradient}
          hoverColor={stat.hoverColor}
        />
      ))}
    </div>
  );
}