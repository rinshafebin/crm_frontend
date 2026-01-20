// Pages/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/layouts/Navbar.jsx';
import { useAuth } from '../context/AuthContext';

// Import dashboard components
import DashboardHeader from '../Components/dashboard/DashboardHeader';
import AdminStatsGrid from '../Components/dashboard/AdminStatsGrid';
import UserQuickActions from '../Components/dashboard/UserQuickActions';
import RecentActivities from '../Components/dashboard/RecentActivities';
import UpcomingTasks from '../Components/dashboard/UpcomingTasks';
import ErrorAlert from '../Components/dashboard/ErrorAlert';
import LoadingSpinner from '../Components/dashboard/LoadingSpinner';

// Import utility functions
import { formatTimeAgo, formatTaskTime, getPriorityColor } from '../Components/utils/dashboardHelpers.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DashboardOverview() {
  const { accessToken, refreshAccessToken, user } = useAuth();
  
  const [stats, setStats] = useState({
    total_leads: 0,
    active_staff: 0,
    total_students: 0,
    leads_change: 0,
    staff_change: 0,
    students_change: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role and name
  const userRole = user?.role || 'User';
  const userName = user?.name || user?.username || 'User';
  const isAdmin = userRole?.toUpperCase() === 'ADMIN';

  // Fetch function with token refresh logic
  const fetchWithAuth = async (url, options = {}) => {
    try {
      let token = accessToken;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
          throw new Error('Unable to refresh token');
        }
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  };

  const fetchStats = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/stats/`);
      setStats({
        total_leads: data.total_leads || 0,
        active_staff: data.active_staff || 0,
        total_students: data.total_students || 0,
        leads_change: data.leads_change || 0,
        staff_change: data.staff_change || 0,
        students_change: data.students_change || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/activities/`);
      setActivities(data.results || data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load recent activities');
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/upcoming/`);
      setTasks(data.results || data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load upcoming tasks');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      if (isAdmin) {
        // Admin gets full stats + activities + tasks
        await Promise.all([
          fetchStats(),
          fetchActivities(),
          fetchTasks()
        ]);
      } else {
        // Regular users only get their activities and tasks
        await Promise.all([
          fetchActivities(),
          fetchTasks()
        ]);
      }
      
      setLoading(false);
    };

    if (accessToken) {
      loadDashboardData();
    }
  }, [accessToken, isAdmin]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader 
          userName={userName}
          userRole={userRole}
          isAdmin={isAdmin}
        />

        <ErrorAlert message={error} />

        {/* Conditional rendering based on user role */}
        {isAdmin ? (
          <AdminStatsGrid stats={stats} />
        ) : (
          <UserQuickActions 
            tasksCount={tasks.length}
            activitiesCount={activities.length}
          />
        )}

        {/* Bottom Section - For All Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities 
            activities={activities}
            formatTimeAgo={formatTimeAgo}
          />
          
          <UpcomingTasks 
            tasks={tasks}
            formatTaskTime={formatTaskTime}
            getPriorityColor={getPriorityColor}
          />
        </div>
      </main>
    </div>
  );
}