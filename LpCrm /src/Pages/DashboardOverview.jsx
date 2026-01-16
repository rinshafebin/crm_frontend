import React, { useState, useEffect } from 'react';
import { Users, UserCheck, GraduationCap, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar.jsx';
import { useAuth } from '../context/AuthContext';

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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleBadgeColor = (role) => {
    const roleUpper = role?.toUpperCase() || 'USER';
    switch (roleUpper) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case 'MANAGER':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'STAFF':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-slate-600 text-white';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Role Badge */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  {userRole.toUpperCase()} Dashboard
                </h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg ${getRoleBadgeColor(userRole)}`}>
                  {userRole.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-lg">
                {getGreeting()}, <span className="font-semibold text-gray-800">{userName}</span>! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Leads */}
          <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase">Total Leads</p>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {stats.total_leads.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm font-medium ${stats.leads_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.leads_change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1.5" />
                  )}
                  <span className="font-bold text-base">{stats.leads_change >= 0 ? '+' : ''}{stats.leads_change}%</span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Active Staff */}
          <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase">Active Staff</p>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  {stats.active_staff.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm font-medium ${stats.staff_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.staff_change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1.5" />
                  )}
                  <span className="font-bold text-base">{stats.staff_change >= 0 ? '+' : ''}{stats.staff_change}</span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase">Total Students</p>
                </div>
                <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {stats.total_students.toLocaleString()}
                </h3>
                <div className={`flex items-center text-sm font-medium ${stats.students_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.students_change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1.5" />
                  )}
                  <span className="font-bold text-base">{stats.students_change >= 0 ? '+' : ''}{stats.students_change}%</span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors">
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No recent activities</p>
                  <p className="text-gray-400 text-xs mt-1">Activities will appear here as they happen</p>
                </div>
              ) : (
                activities.slice(0, 5).map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {activity.activity_type || activity.title || 'Activity'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.user_name || activity.description || 'No description'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap mt-1">
                      {formatTimeAgo(activity.created_at || activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Tasks</h2>
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors">
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No upcoming tasks</p>
                  <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task, index) => (
                  <div 
                    key={task.id || index} 
                    className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed || false}
                      onChange={() => {}}
                      className="mt-1.5 w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {task.title || task.name || 'Untitled Task'}
                        </p>
                        {task.priority && (
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {formatTaskTime(task.due_date || task.deadline)}
                      </div>
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