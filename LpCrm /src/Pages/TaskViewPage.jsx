import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, User, Flag, FileText, Clock, Edit2, CheckCircle, AlertTriangle, Loader, Circle, AlertCircle, XCircle, MessageSquare, StickyNote } from 'lucide-react';

export default function TaskViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [task, setTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  const priorityBadgeColors = {
    URGENT: 'bg-red-100 text-red-700 border-red-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  };

  const statusColors = {
    PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    OVERDUE: 'bg-red-100 text-red-700 border-red-300',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-300'
  };

  const statusIcons = {
    PENDING: <Circle className="w-4 h-4" />,
    IN_PROGRESS: <Loader className="w-4 h-4" />,
    COMPLETED: <CheckCircle className="w-4 h-4" />,
    OVERDUE: <AlertTriangle className="w-4 h-4" />,
    CANCELLED: <XCircle className="w-4 h-4" />
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        let token = accessToken;

        if (!token) {
          token = await refreshAccessToken();
          if (!token) {
            throw new Error('Authentication required');
          }
        }

        // Fetch task details
        const taskUrl = `${API_BASE_URL}/tasks/${id}/`;
        const taskResponse = await fetch(taskUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!taskResponse.ok) {
          throw new Error('Failed to fetch task details');
        }

        const taskData = await taskResponse.json();
        setTask(taskData);

        // Fetch task updates
        const updatesUrl = `${API_BASE_URL}/tasks/${id}/updates/`;
        const updatesResponse = await fetch(updatesUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (updatesResponse.ok) {
          const updatesData = await updatesResponse.json();
          const updatesList = updatesData.results || [];
          setUpdates(updatesList);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Open completion modal
  const handleOpenCompletionModal = () => {
    setShowCompletionModal(true);
    setCompletionNotes('');
  };

  // Close completion modal
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setCompletionNotes('');
  };

  // Submit task completion with notes
  const handleSubmitCompletion = async () => {
    if (!completionNotes.trim()) {
      alert('Please provide completion notes before marking the task as complete.');
      return;
    }

    if (completionNotes.trim().length < 10) {
      alert('Please provide at least 10 characters in completion notes.');
      return;
    }

    try {
      setSubmittingCompletion(true);
      let token = accessToken;

      if (!token) {
        token = await refreshAccessToken();
        if (!token) {
          alert('Session expired. Please login again.');
          return;
        }
      }

      const statusUrl = `${API_BASE_URL}/tasks/${id}/status/`;
      const requestBody = {
        status: 'COMPLETED',
        notes: completionNotes.trim()
      };

      const response = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { detail: responseText };
        }
        throw new Error(errorData.detail || 'Failed to update task');
      }

      // Refresh task details
      const taskResponse = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (taskResponse.ok) {
        const taskData = await taskResponse.json();
        setTask(taskData);
      }

      // Refresh updates
      const updatesResponse = await fetch(`${API_BASE_URL}/tasks/${id}/updates/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json();
        const updatesList = updatesData.results || [];
        setUpdates(updatesList);
      }

      // Close modal and show success
      setShowCompletionModal(false);
      alert('Task marked as completed successfully!');
    } catch (err) {
      console.error('Error completing task:', err);
      alert(err.message || 'Failed to update task. Please try again.');
    } finally {
      setSubmittingCompletion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Failed to Load Task</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/staff/tasks')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Tasks
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-slate-200">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{task.title}</h1>
          <p className="text-slate-500 text-lg mb-6">Task Details & Information</p>

          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border-2 ${statusColors[task.status]}`}>
              {statusIcons[task.status]}
              {task.status.replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 rounded-xl font-semibold border-2 ${priorityBadgeColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(`/tasks/edit/${id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Edit Task
            </button>
            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
              <button
                onClick={handleOpenCompletionModal}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* Time Status Alert */}
        {task.is_overdue && task.overdue_days > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1">Task Overdue</h3>
              <p className="text-red-700">
                This task is {task.overdue_days} days past its deadline. Immediate attention required.
              </p>
            </div>
          </div>
        )}

        {!task.is_overdue && task.days_until_deadline > 0 && task.days_until_deadline <= 3 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-800 font-bold text-lg mb-1">Deadline Approaching</h3>
              <p className="text-amber-700">
                {task.days_until_deadline} days remaining until the deadline.
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description and Updates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-800">Description</h2>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Task Notes Section - if task has a notes field */}
            {task.notes && (
              <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <StickyNote className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Task Notes</h2>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {task.notes}
                </p>
              </div>
            )}

            {/* Task Updates Section */}
            {updates && updates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Activity History</h2>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {updates.length} {updates.length === 1 ? 'update' : 'updates'}
                  </span>
                </div>

                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id} className="relative pl-8 pb-6 last:pb-0">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 w-3 h-3 bg-indigo-600 rounded-full border-4 border-white shadow"></div>
                      {index !== updates.length - 1 && (
                        <div className="absolute left-1.5 top-4 w-0.5 h-full bg-slate-200"></div>
                      )}

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                              {update.previous_status.replace('_', ' ')} → {update.new_status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(update.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{update.updated_by_name || 'Unknown user'}</span>
                        </div>

                        {/* Update Notes */}
                        {update.notes && update.notes.trim() && (
                          <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-semibold text-slate-700">Notes</span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {update.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Updates Message */}
            {(!updates || updates.length === 0) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Activity History</h2>
                </div>
                <p className="text-slate-500 text-center py-8">
                  No activity updates yet for this task.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Details Sidebar */}
          <div className="space-y-6">
            {/* Assigned To */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Assigned To</h3>
              </div>
              <p className="text-slate-700 font-medium">{task.assigned_to_name}</p>
            </div>

            {/* Assigned By */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Assigned By</h3>
              </div>
              <p className="text-slate-700 font-medium">{task.assigned_by_name}</p>
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Deadline</h3>
              </div>
              <p className="text-slate-700 font-medium">{formatDate(task.deadline)}</p>
            </div>

            {/* Created At */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Created</h3>
              </div>
              <p className="text-slate-700 font-medium">{formatDate(task.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <h2 className="text-3xl font-bold text-slate-800">Complete Task</h2>
              </div>
              
              <p className="text-slate-600 mb-6">
                Please provide details about the task completion. This information will be saved in the activity history.
              </p>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2">
                  Completion Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Describe what was completed, any challenges faced, results achieved, etc..."
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Minimum 10 characters required. Current: {completionNotes.trim().length} characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseCompletionModal}
                  disabled={submittingCompletion}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompletion}
                  disabled={submittingCompletion || !completionNotes.trim() || completionNotes.trim().length < 10}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingCompletion ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}