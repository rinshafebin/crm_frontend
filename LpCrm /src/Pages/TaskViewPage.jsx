import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Flag, 
  FileText, 
  Clock, 
  Edit2, 
  CheckCircle, 
  AlertTriangle,
  Loader,
  Circle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function TaskViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const priorityColors = {
    URGENT: 'bg-red-50 border-red-300 text-red-700',
    HIGH: 'bg-orange-50 border-orange-300 text-orange-700',
    MEDIUM: 'bg-blue-50 border-blue-300 text-blue-700',
    LOW: 'bg-green-50 border-green-300 text-green-700'
  };

  const priorityIcons = {
    URGENT: '⬤',
    HIGH: '◉',
    MEDIUM: '◐',
    LOW: '○'
  };

  const statusColors = {
    PENDING: 'bg-gray-50 border-gray-300 text-gray-700',
    IN_PROGRESS: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    COMPLETED: 'bg-green-50 border-green-300 text-green-700',
    OVERDUE: 'bg-red-50 border-red-300 text-red-700',
    CANCELLED: 'bg-slate-50 border-slate-300 text-slate-600'
  };

  const statusIcons = {
    PENDING: <Circle className="w-5 h-5" />,
    IN_PROGRESS: <AlertCircle className="w-5 h-5" />,
    COMPLETED: <CheckCircle className="w-5 h-5" />,
    OVERDUE: <AlertTriangle className="w-5 h-5" />,
    CANCELLED: <XCircle className="w-5 h-5" />
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        let token = accessToken;
        
        if (!token) {
          token = await refreshAccessToken();
          if (!token) throw new Error('Authentication required');
        }

        const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch task details');
        }

        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, accessToken, refreshAccessToken, API_BASE_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleMarkComplete = async () => {
    try {
      let token = accessToken;
      if (!token) {
        token = await refreshAccessToken();
        if (!token) {
          alert('Session expired. Please login again.');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      alert('Task marked as completed!');
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-slate-600 font-medium">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to load task</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Tasks</span>
        </button>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Task Details</h1>
            <p className="text-slate-600">View complete information about this task</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/tasks/${id}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all"
            >
              <Edit2 size={18} />
              Edit Task
            </button>
            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <CheckCircle size={18} />
                Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Task Title & Status */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-3xl font-bold">{task.title}</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${statusColors[task.status]} bg-white`}>
                {statusIcons[task.status]}
                <span className="font-semibold">{task.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${priorityColors[task.priority]} bg-white`}>
                <span className="text-xl">{priorityIcons[task.priority]}</span>
                <span className="font-semibold">{task.priority} Priority</span>
              </span>
            </div>
          </div>

          {/* Task Details */}
          <div className="p-8 space-y-6">
            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                Description
              </label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Assigned To */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User className="w-4 h-4 text-indigo-600" />
                  Assigned To
                </label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-slate-900 font-medium">{task.assigned_to_name}</p>
                </div>
              </div>

              {/* Assigned By */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User className="w-4 h-4 text-indigo-600" />
                  Assigned By
                </label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-slate-900 font-medium">{task.assigned_by_name}</p>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Deadline
                </label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-slate-900 font-medium">{formatDate(task.deadline)}</p>
                </div>
              </div>

              {/* Created At */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Created At
                </label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-slate-900 font-medium">{formatDate(task.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Time Status */}
            {task.is_overdue && task.overdue_days > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-600" size={24} />
                  <div>
                    <p className="text-red-900 font-bold text-lg">Overdue</p>
                    <p className="text-red-700">This task is {task.overdue_days} days overdue</p>
                  </div>
                </div>
              </div>
            )}

            {!task.is_overdue && task.days_until_deadline > 0 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Flag className="text-blue-600" size={24} />
                  <div>
                    <p className="text-blue-900 font-bold text-lg">Time Remaining</p>
                    <p className="text-blue-700">{task.days_until_deadline} days until deadline</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}