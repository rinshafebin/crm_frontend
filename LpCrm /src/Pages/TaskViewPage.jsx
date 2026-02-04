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
          if (!token) throw new Error('Authentication required');
        }

        // Fetch task details
        const taskResponse = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
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
        const updatesResponse = await fetch(`${API_BASE_URL}/tasks/${id}/updates/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (updatesResponse.ok) {
          const updatesData = await updatesResponse.json();
          setUpdates(updatesData);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching task data:', err);
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

      // Use the task status update endpoint with notes
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          notes: completionNotes.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
        setUpdates(updatesData);
      }

      // Close modal and show success
      setShowCompletionModal(false);
      alert('Task marked as completed successfully!');
    } catch (err) {
      console.error('Error updating task:', err);
      alert(err.message || 'Failed to update task. Please try again.');
    } finally {
      setSubmittingCompletion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-lg">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to Load Task</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/tasks')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/staff/tasks')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Tasks
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    {task.title}
                  </h1>
                  <p className="text-slate-500 text-sm">Task Details & Information</p>
                </div>
              </div>

              {/* Status and Priority Badges */}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border ${statusColors[task.status]}`}>
                  {statusIcons[task.status]}
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border ${priorityBadgeColors[task.priority]}`}>
                  <Flag className="w-4 h-4" />
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/tasks/${id}/edit`)}
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
        </div>

        {/* Time Status Alert */}
        {task.is_overdue && task.overdue_days > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-1">Task Overdue</h3>
                <p className="text-red-700">This task is {task.overdue_days} days past its deadline. Immediate attention required.</p>
              </div>
            </div>
          </div>
        )}

        {!task.is_overdue && task.days_until_deadline > 0 && task.days_until_deadline <= 3 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg mb-1">Deadline Approaching</h3>
                <p className="text-amber-700">{task.days_until_deadline} days remaining until the deadline.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Description and Updates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Description</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'No description provided for this task.'}
                </p>
              </div>
            </div>

            {/* Task Notes Section - if task has a notes field */}
            {task.notes && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl border border-amber-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <StickyNote className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Task Notes</h2>
                </div>
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {task.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Task Updates Section */}
            {updates && updates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Activity History</h2>
                  <span className="ml-auto bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {updates.length} {updates.length === 1 ? 'update' : 'updates'}
                  </span>
                </div>

                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id || index} className="border-l-2 border-slate-200 pl-6 pb-6 last:pb-0 relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>

                      <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[update.previous_status]}`}>
                              {update.previous_status.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[update.new_status]}`}>
                              {update.new_status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDateTime(update.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{update.updated_by_name || 'Unknown user'}</span>
                        </div>

                        {/* Update Notes - Enhanced Display */}
                        {update.notes && update.notes.trim() && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-start gap-2">
                              <StickyNote className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {update.notes}
                                </p>
                              </div>
                            </div>
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
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Activity History</h2>
                </div>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No activity updates yet for this task.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details Sidebar */}
          <div className="space-y-6">
            {/* Assigned To */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Assigned To</h3>
              </div>
              <p className="text-slate-700 font-medium">{task.assigned_to_name}</p>
            </div>

            {/* Assigned By */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Assigned By</h3>
              </div>
              <p className="text-slate-700 font-medium">{task.assigned_by_name}</p>
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Deadline</h3>
              </div>
              <p className="text-slate-700 font-medium">{formatDate(task.deadline)}</p>
            </div>

            {/* Created At */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Created</h3>
              </div>
              <p className="text-slate-700 font-medium">{formatDate(task.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Complete Task</h2>
            </div>

            <p className="text-slate-600 mb-6">
              Please provide details about the task completion. This information will be saved in the activity history.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                Minimum 10 characters required
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
  );
}