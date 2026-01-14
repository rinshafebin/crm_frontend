import React, { useState, useEffect } from 'react';
import { Users, UserCheck, GraduationCap, Calendar } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar.jsx';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DashboardOverview() {
  const { accessToken, refreshAccessToken } = useAuth();
  
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

      // If token expired, refresh and retry
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

  // Fetch dashboard stats
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

  // Fetch recent activities
  const fetchActivities = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/activities/`);
      setActivities(data.results || data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load recent activities');
    }
  };

  // Fetch upcoming tasks
  const fetchTasks = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/upcoming/`);
      setTasks(data.results || data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load upcoming tasks');
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchTasks()
      ]);
      
      setLoading(false);
    };

    if (accessToken) {
      loadDashboardData();
    }
  }, [accessToken]);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Format date/time for tasks
  const formatTaskTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Leads */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  {stats.total_leads.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm ${stats.leads_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={stats.leads_change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                    />
                  </svg>
                  <span className="font-medium">{stats.leads_change >= 0 ? '+' : ''}{stats.leads_change}%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Active Staff</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  {stats.active_staff.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm ${stats.staff_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={stats.staff_change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                    />
                  </svg>
                  <span className="font-medium">{stats.staff_change >= 0 ? '+' : ''}{stats.staff_change}</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Students</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  {stats.total_students.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm ${stats.students_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={stats.students_change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                    />
                  </svg>
                  <span className="font-medium">{stats.students_change >= 0 ? '+' : ''}{stats.students_change}%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
              ) : (
                activities.slice(0, 5).map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className={`flex items-start space-x-3 ${index < activities.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.activity_type || activity.title || 'Activity'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.user_name || activity.description || 'No description'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at || activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
              ) : (
                tasks.slice(0, 5).map((task, index) => (
                  <div 
                    key={task.id || index} 
                    className={`flex items-start space-x-3 ${index < tasks.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed || false}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-blue-600 rounded" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {task.title || task.name || 'Untitled Task'}
                        </p>
                        {task.priority && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority.toLowerCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatTaskTime(task.due_date || task.deadline)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}