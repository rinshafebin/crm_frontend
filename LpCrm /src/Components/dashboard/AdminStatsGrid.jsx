import React from 'react';
import { Users, UserCheck, GraduationCap } from 'lucide-react';
import StatCard from './StatsGrid'

export default function AdminStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Leads"
        value={stats.total_leads}
        change={stats.leads_change}
        icon={Users}
        gradient="from-blue-500 to-blue-600"
        hoverColor="blue"
      />
      <StatCard
        title="Active Staff"
        value={stats.active_staff}
        change={stats.staff_change}
        icon={UserCheck}
        gradient="from-green-500 to-emerald-600"
        hoverColor="green"
      />
      <StatCard
        title="Total Students"
        value={stats.total_students}
        change={stats.students_change}
        icon={GraduationCap}
        gradient="from-purple-500 to-indigo-600"
        hoverColor="purple"
      />
    </div>
  );
}