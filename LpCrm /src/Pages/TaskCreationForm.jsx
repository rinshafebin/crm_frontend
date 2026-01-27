import React, { useState, useEffect } from 'react';
import { Calendar, User, Flag, FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TaskCreationForm() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignTo: '',
    priority: 'MEDIUM',
    deadline: '',
  });

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-green-50 border-green-300 text-green-700', icon: '○' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 border-blue-300 text-blue-700', icon: '◐' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-50 border-orange-300 text-orange-700', icon: '◉' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-50 border-red-300 text-red-700', icon: '⬤' },
  ];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.assignTo) {
      newErrors.assigned_to = 'Please select a team member';
    }


    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    let token = accessToken;
    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        alert('Session expired. Please login again.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigned_to: parseInt(formData.assignTo, 10),
        priority: formData.priority,
        deadline: formData.deadline,
      };


      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data) {
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
        throw new Error(data.detail || 'Task creation failed');
      }

      alert('Task created successfully!');
      handleCancel();
      navigate('staff/tasks');
    } catch (error) {
      alert(error.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        let token = accessToken;
        if (!token) {
          token = await refreshAccessToken();
          if (!token) {
            setTeamMembers([]);
            return;
          }
        }


        const res = await fetch(`${API_BASE_URL}/employees/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch employees: ${res.status}`);
        }

        const data = await res.json();

        let employeeList = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (data.results && Array.isArray(data.results)) {
            employeeList = data.results;
          } else {
            console.log('❌ No results or data property found');
          }
        }

        if (Array.isArray(employeeList) && employeeList.length > 0) {
          setTeamMembers(employeeList);
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        setTeamMembers([]);
      }
    };

    fetchTeamMembers();
  }, [accessToken, refreshAccessToken, API_BASE_URL]);

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      assignTo: '',
      priority: 'MEDIUM',
      deadline: '',
    });
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
          disabled={loading}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Task</h1>
            <p className="text-slate-600">Fill in the details to create a new task for your team</p>
          </div>
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
                  className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.title ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900`}
                  placeholder="Enter a clear and concise task title"
                  disabled={loading}
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
                  className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.description ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-900`}
                  placeholder="Provide detailed information about the task objectives and requirements"
                  disabled={loading}
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
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.assigned_to ? 'border-red-500' : 'border-slate-200'}
                    rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-10 text-slate-900`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center'
                    }}
                    disabled={loading}
                  >
                    <option value="">Select team member</option>
                    {Array.isArray(teamMembers) && teamMembers.length > 0 && teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username} — {member.role.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.assigned_to && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                      <AlertCircle size={14} />
                      <span>{errors.assigned_to}</span>
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
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${errors.deadline ? 'border-red-500' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900`}
                    disabled={loading}
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
                      className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${formData.priority === priority.value
                        ? priority.color + ' shadow-md scale-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => handleFieldChange('priority', e.target.value)}
                        className="absolute opacity-0"
                        disabled={loading}
                      />
                      <span className="text-lg">{priority.icon}</span>
                      <span className="font-semibold text-sm">{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}