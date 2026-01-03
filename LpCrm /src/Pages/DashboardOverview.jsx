import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  ListTodo,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

import StatsGrid from '../components/dashboard/StatsGrid';
import RecentActivities from '../components/dashboard/RecentActivities';
import UpcomingTasks from '../components/dashboard/UpcomingTasks';
import Navbar from '../Components/Navbar';

export default function DashboardOverview() {
  const stats = useMemo(() => [
    { title: 'Total Leads', value: '2,543', change: '+12.5%', trend: 'up', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Staff', value: '48', change: '+3', trend: 'up', icon: UserCheck, color: 'bg-green-500' },
    { title: 'Total Students', value: '1,847', change: '+8.2%', trend: 'up', icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Pending Tasks', value: '127', change: '-5', trend: 'down', icon: ListTodo, color: 'bg-orange-500' },
    { title: 'Revenue', value: '$89,432', change: '+15.3%', trend: 'up', icon: DollarSign, color: 'bg-indigo-500' },
    { title: 'Conversion Rate', value: '68%', change: '+2.4%', trend: 'up', icon: TrendingUp, color: 'bg-pink-500' },
  ], []);

  const recentActivities = useMemo(() => [
    { action: 'New lead registered', user: 'John Doe', time: '5 mins ago' },
    { action: 'Task completed', user: 'Sarah Smith', time: '12 mins ago' },
    { action: 'Student enrolled', user: 'Mike Johnson', time: '1 hour ago' },
    { action: 'Report generated', user: 'Emily Brown', time: '2 hours ago' },
    { action: 'Staff member added', user: 'Admin', time: '3 hours ago' },
  ], []);

  const upcomingTasks = useMemo(() => [
    { title: 'Follow up with leads', date: 'Today, 2:00 PM', priority: 'high' },
    { title: 'Staff meeting', date: 'Today, 4:30 PM', priority: 'medium' },
    { title: 'Review student applications', date: 'Tomorrow, 10:00 AM', priority: 'high' },
    { title: 'Prepare monthly report', date: 'Dec 31, 2025', priority: 'medium' },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities activities={recentActivities} />
          <UpcomingTasks tasks={upcomingTasks} />
        </div>
      </div>
    </div>
  );
}
