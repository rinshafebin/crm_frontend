import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  User, 
  Flag, 
  FileText, 
  ArrowLeft, 
  AlertCircle,
  Loader,
  Save
} from 'lucide-react';

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialTask, setInitialTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignTo: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    deadline: '',
  });

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-green-50 border-green-300 text-green-700', icon: '○' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 border-blue-300 text-blue-700', icon: '◐' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-50 border-orange-300 text-orange-700', icon: '◉' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-50 border-red-300 text-red-700', icon: '⬤' },
  ];

  const statuses = [
    { value: 'PENDING', label: 'Pending', color: 'bg-gray-50 border-gray-300 text-gray-700' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300 text-green-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-50 border-slate-300 text-slate-600' },
  ];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
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
        setInitialTask(taskData);

        // Convert date to YYYY-MM-DD format
        const deadlineDate = taskData.deadline ? taskData.deadline.split('T')[0] : '';

        setFormData({
          title: taskData.title,
          description: taskData.description,
          assignTo: taskData.assigned_to.toString(),
          priority: taskData.priority,
          status: taskData.status,
          deadline: deadlineDate,
        });

        // Fetch team members
        const membersResponse = await fetch(`${API_BASE_URL}/employees/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!membersResponse.ok) {
          throw new Error('Failed to fetch employees');
        }

        const membersData = await membersResponse.json();
        setTeamMembers(membersData.results || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert('Failed to load task details. Please try again.');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, accessToken, refreshAccessToken, API_BASE_URL, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.assignTo) {
      newErrors.assignTo = 'Please select a team member';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    let token = accessToken;
    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        alert('Session expired. Please login again.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigned_to: parseInt(formData.assignTo, 10),
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline,
      };

      console.log('Updating task with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data) {
          const backendErrors = {};
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              backendErrors[key] = data[key][0];
            } else {
              backendErrors[key] = data[key];
            }
          });
          setErrors(backendErrors);
          throw new Error(Object.values(backendErrors).join(', '));
        }
        throw new Error(data.detail || 'Task update failed');
      }

      alert('Task updated successfully!');
      navigate(`/tasks/${id}`);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
          disabled={submitting}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Task</h1>
          <p className="text-slate-600">Update the task details below</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className={`w-full px-4 py-3.5 bg-slate-50 border ${
                    errors.title ? 'border-red-500' : 'border-slate-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900`}
                  placeholder="Enter a clear and concise task title"
                  disabled={submitting}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle size={14} />
                    <span>{errors.title}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows="5"
                  className={`w-full px-4 py-3.5 bg-slate-50 border ${
                    errors.description ? 'border-red-500' : 'border-slate-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-900`}
                  placeholder="Provide detailed information about the task objectives and requirements"
                  disabled={submitting}
                />
                {errors.description && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle size={14} />
                    <span>{errors.description}</span>
                  </div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Assign To */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <User className="w-4 h-4 text-indigo-600" />
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.assignTo}
                    onChange={(e) => handleFieldChange('assignTo', e.target.value)}
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${
                      errors.assignTo ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-10 text-slate-900`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center'
                    }}
                    disabled={submitting}
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username} — {member.role.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.assignTo && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                      <AlertCircle size={14} />
                      <span>{errors.assignTo}</span>
                    </div>
                  )}
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleFieldChange('deadline', e.target.value)}
                    min={getTodayDate()}
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${
                      errors.deadline ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900`}
                    disabled={submitting}
                  />
                  {errors.deadline && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                      <AlertCircle size={14} />
                      <span>{errors.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <Flag className="w-4 h-4 text-indigo-600" />
                  Priority Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priorities.map((priority) => (
                    <label
                      key={priority.value}
                      className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.priority === priority.value
                          ? priority.color + ' shadow-md scale-105'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => handleFieldChange('priority', e.target.value)}
                        className="absolute opacity-0"
                        disabled={submitting}
                      />
                      <span className="text-lg">{priority.icon}</span>
                      <span className="font-semibold text-sm">{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <AlertCircle className="w-4 h-4 text-indigo-600" />
                  Task Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {statuses.map((status) => (
                    <label
                      key={status.value}
                      className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.status === status.value
                          ? status.color + ' shadow-md scale-105'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={formData.status === status.value}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="absolute opacity-0"
                        disabled={submitting}
                      />
                      <span className="font-semibold text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/tasks/${id}`)}
                className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={submitting}
              >
                <Save size={18} />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}