import React from 'react';
import { Users, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
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
      value: statusCounts.PRESENT || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      hoverColor: 'green'
    },
    {
      title: 'Absent',
      value: statusCounts.ABSENT || 0,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      hoverColor: 'red'
    },
    {
      title: 'No Session',
      value: statusCounts.NO_SESSION || 0,
      icon: MinusCircle,
      gradient: 'from-gray-500 to-gray-600',
      hoverColor: 'gray'
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