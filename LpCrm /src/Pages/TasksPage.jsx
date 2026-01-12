import Navbar from '../Components/layouts/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

import {
  Search, Plus, Calendar, User, Flag,
  CheckCircle, Circle, AlertCircle,
  ListTodo, Loader, CheckCheck,
  AlertTriangle, XCircle, Filter, TrendingUp
} from 'lucide-react';

export default function TasksPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statsData = stats ? [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'bg-gradient-to-br from-blue-500 to-blue-600', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'In Progress', value: stats.in_progress, icon: Loader, color: 'bg-gradient-to-br from-amber-500 to-amber-600', lightBg: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCheck, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-gradient-to-br from-red-500 to-red-600', lightBg: 'bg-red-50', textColor: 'text-red-600' },
  ] : [];

  const priorityColors = {
    URGENT: 'bg-red-100 text-red-700 border-red-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  };

  const statusIcons = {
    PENDING: <Circle className="text-slate-400" size={20} />,
    IN_PROGRESS: <AlertCircle className="text-amber-500" size={20} />,
    COMPLETED: <CheckCircle className="text-emerald-500" size={20} />,
    OVERDUE: <AlertTriangle className="text-red-500" size={20} />,
    CANCELLED: <XCircle className="text-slate-500" size={20} />
  };

  const statusColors = {
    PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    OVERDUE: 'bg-red-100 text-red-700 border-red-300',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-300'
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        let token = accessToken || await refreshAccessToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetch(
          `${API_BASE_URL}/tasks/?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch tasks');

        const data = await response.json();

        setTasks(data.results);
        setStats(data.stats);
        setCount(data.count);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page, accessToken, refreshAccessToken, API_BASE_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMarkComplete = async (taskId) => {
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          notes: 'Marked as completed'
        })
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const tasksResponse = await fetch(
        `${API_BASE_URL}/tasks/?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        setTasks(data.results);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error marking task as complete:', err);
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || task.status === filterStatus;

    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]">
          <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-slate-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Error Loading Tasks</h3>
            <p className="text-slate-600 text-center mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <ListTodo className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Tasks Management</h1>
              </div>
              <p className="text-slate-600 text-lg ml-[60px]">Organize, track, and manage all your tasks efficiently</p>
            </div>
            <button
              onClick={() => navigate('/tasks/new')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              <Plus size={20} />
              Create New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                  <TrendingUp className={`${stat.textColor} w-5 h-5`} />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filter & Search</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-slate-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-slate-700 bg-white"
            >
              <option value="all">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListTodo className="text-slate-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No tasks found</h3>
            <p className="text-slate-600 mb-6 text-lg">
              {tasks.length === 0
                ? "Get started by creating your first task to organize your work"
                : "Try adjusting your search criteria or filters"}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => navigate('/tasks/new')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
              >
                <Plus size={20} />
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 p-6 hover:border-indigo-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Task Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg">
                      {statusIcons[task.status]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                          {task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{task.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <span className="font-medium">To:</span> <span className="text-slate-700">{task.assigned_to_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="p-1.5 bg-purple-50 rounded-lg">
                            <User size={14} className="text-purple-600" />
                          </div>
                          <span className="font-medium">By:</span> <span className="text-slate-700">{task.assigned_by_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="p-1.5 bg-rose-50 rounded-lg">
                            <Calendar size={14} className="text-rose-600" />
                          </div>
                          <span className="font-medium">Due:</span> <span className="text-slate-700">{formatDate(task.deadline)}</span>
                        </div>
                        {task.is_overdue && task.overdue_days > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-lg border border-red-200">
                            <AlertTriangle size={14} className="text-red-600" />
                            <span className="font-semibold text-red-700">{task.overdue_days} days overdue</span>
                          </div>
                        )}
                        {!task.is_overdue && task.days_until_deadline > 0 && task.days_until_deadline <= 3 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                            <Flag size={14} className="text-amber-600" />
                            <span className="font-semibold text-amber-700">{task.days_until_deadline} days left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-col lg:items-stretch">
                    <button
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex-1 lg:flex-none px-4 py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 text-sm font-semibold border border-indigo-200 hover:border-indigo-300"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/tasks/edit/${task.id}`)}
                      className="flex-1 lg:flex-none px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-semibold border border-blue-200 hover:border-blue-300"
                    >
                      Edit
                    </button>
                    {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleMarkComplete(task.id)}
                        className="flex-1 lg:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(hasNext || hasPrev) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!hasPrev}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                hasPrev
                  ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
              }`}
            >
              Previous
            </button>
            <div className="px-6 py-3 bg-white border-2 border-indigo-200 text-slate-700 font-bold rounded-xl shadow-md">
              Page {page}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasNext}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                hasNext
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Results count */}
        {filteredTasks.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-indigo-600">{filteredTasks.length}</span> of <span className="font-bold text-indigo-600">{tasks.length}</span> tasks
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}