import React, { useState, useEffect } from 'react';
import Navbar from '../Components/layouts/Navbar';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../Components/dashboard/DashboardHeader';
import AdminStatsGrid from '../Components/dashboard/AdminStatsGrid';
import UserQuickActions from '../Components/dashboard/UserQuickActions';
import RecentActivities from '../Components/dashboard/RecentActivities';
import UpcomingTasks from '../Components/dashboard/UpcomingTasks';
import UpcomingTasksSection from '../Components/dashboard/UpcomingTasksSection';
import ErrorAlert from '../Components/dashboard/ErrorAlert';
import LoadingSpinner from '../Components/dashboard/LoadingSpinner';
import { formatTimeAgo, formatTaskTime, getPriorityColor } from '../Components/utils/dashboardHelpers';

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
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = user?.role || 'User';
  const userName = user?.name || user?.username || 'User';
  const isAdmin = userRole?.toUpperCase() === 'ADMIN';

  const fetchWithAuth = async (url, options = {}) => {
    try {
      let token = accessToken;
      
      const makeRequest = async (authToken) => {
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            ...options.headers,
          },
        });
      };

      let response = await makeRequest(token);

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Unable to refresh token');
        response = await makeRequest(token);
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  };

  const fetchData = async (endpoint, setter, errorMsg) => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}${endpoint}`);
      setter(data.results || data || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(errorMsg);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      const fetchPromises = [
        fetchData('/activities/', setActivities, 'Failed to load recent activities'),
        // Fetch all pending tasks
        fetchData('/tasks/pending/', setTasks, 'Failed to load pending tasks'),
        // Also fetch upcoming tasks
        fetchData('/upcoming/', setUpcomingTasks, 'Failed to load upcoming tasks')
      ];

      if (isAdmin) {
        fetchPromises.push(
          fetchData('/stats/', (data) => {
            setStats({
              total_leads: data.total_leads || 0,
              active_staff: data.active_staff || 0,
              total_students: data.total_students || 0,
              leads_change: data.leads_change || 0,
              staff_change: data.staff_change || 0,
              students_change: data.students_change || 0
            });
          }, 'Failed to load dashboard statistics')
        );
      }
      
      await Promise.all(fetchPromises);
      setLoading(false);
    };

    if (accessToken) loadDashboardData();
  }, [accessToken, isAdmin]);

  if (loading) return <LoadingSpinner />;

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

        {isAdmin ? (
          <AdminStatsGrid stats={stats} />
        ) : (
          <UserQuickActions 
            tasksCount={tasks.length}
            activitiesCount={activities.length}
            upcomingCount={upcomingTasks.length}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <RecentActivities 
              activities={activities}
              formatTimeAgo={formatTimeAgo}
            />
          </div>
          
          <div className="xl:col-span-1">
            <UpcomingTasks 
              tasks={tasks}
              formatTaskTime={formatTaskTime}
              getPriorityColor={getPriorityColor}
            />
          </div>

          <div className="xl:col-span-1">
            <UpcomingTasksSection 
              tasks={upcomingTasks}
              formatTaskTime={formatTaskTime}
              getPriorityColor={getPriorityColor}
            />
          </div>
        </div>
      </main>
    </div>
  );
}