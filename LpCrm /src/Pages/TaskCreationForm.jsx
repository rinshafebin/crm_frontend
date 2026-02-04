import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Flag, FileText, ArrowLeft, AlertCircle, Search, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TaskCreationForm() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

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

  // Role display configuration
  const roleConfig = {
    'ADM_EXEC': { label: 'Admin Executive', color: 'bg-purple-100 text-purple-700' },
    'ADMIN': { label: 'Admin', color: 'bg-indigo-100 text-indigo-700' },
    'ADM_MANAGER': { label: 'Admin Manager', color: 'bg-blue-100 text-blue-700' },
    'MEDIA': { label: 'Media', color: 'bg-pink-100 text-pink-700' },
    'FOE': { label: 'Front of Exec', color: 'bg-cyan-100 text-cyan-700' },
    'TRAINER': { label: 'Trainer', color: 'bg-green-100 text-green-700' },
    'ACCOUNTS': { label: 'Accounts', color: 'bg-amber-100 text-amber-700' },
    'CM': { label: 'Central Manager', color: 'bg-teal-100 text-teal-700' },
    'OPS': { label: 'Operations', color: 'bg-orange-100 text-orange-700' },
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get initials for avatar
  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.split('_');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  // Get avatar color based on username
  const getAvatarColor = (username) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Format username for display
  const formatUsername = (username) => {
    if (!username) return 'Unknown';
    return username.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get role info
  const getRoleInfo = (role) => {
    return roleConfig[role] || { 
      label: role.replace(/_/g, ' '), 
      color: 'bg-gray-100 text-gray-700',
      icon: '👤'
    };
  };

  // Filter team members based on search
  const filteredMembers = teamMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    const username = formatUsername(member.username).toLowerCase();
    const role = getRoleInfo(member.role).label.toLowerCase();
    return username.includes(searchLower) || role.includes(searchLower);
  });

  // Group members by role
  const groupedMembers = filteredMembers.reduce((acc, member) => {
    const role = member.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {});

  // Get selected member
  const selectedMember = teamMembers.find(m => m.id === parseInt(formData.assignTo));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      setFormData({
        title: '',
        description: '',
        assignTo: '',
        priority: 'MEDIUM',
        deadline: '',
      });
      setErrors({});

      navigate('/staff/tasks');

    } catch (error) {
      console.error('Task creation error:', error);
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
          }
        }

        if (Array.isArray(employeeList) && employeeList.length > 0) {
          setTeamMembers(employeeList);
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
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
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSelectMember = (memberId) => {
    handleFieldChange('assignTo', memberId);
    setIsDropdownOpen(false);
    setSearchQuery('');
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
                {/* Assign To - Custom Dropdown */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <User className="w-4 h-4 text-indigo-600" />
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Selected Display / Dropdown Trigger */}
                  <div
                    onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 bg-slate-50 border ${
                      errors.assigned_to ? 'border-red-500' : 'border-slate-200'
                    } rounded-xl cursor-pointer hover:border-indigo-300 transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {selectedMember ? (
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(selectedMember.username)}`}>
                            {getInitials(selectedMember.username)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900">
                              {formatUsername(selectedMember.username)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {getRoleInfo(selectedMember.role).label}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Select team member</span>
                      )}
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full md:w-[calc(50%-12px)] bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b border-slate-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Members List */}
                      <div className="max-h-80 overflow-y-auto">
                        {Object.keys(groupedMembers).length === 0 ? (
                          <div className="p-4 text-center text-slate-500">
                            No members found
                          </div>
                        ) : (
                          Object.entries(groupedMembers).map(([role, members]) => {
                            const roleInfo = getRoleInfo(role);
                            return (
                              <div key={role}>
                                {/* Role Header */}
                                <div className="sticky top-0 px-4 py-2 bg-slate-50 border-b border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{roleInfo.icon}</span>
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                      {roleInfo.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      ({members.length})
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Members in Role */}
                                {members.map((member) => (
                                  <div
                                    key={member.id}
                                    onClick={() => handleSelectMember(member.id.toString())}
                                    className={`px-4 py-3 cursor-pointer transition-all ${
                                      formData.assignTo === member.id.toString()
                                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${getAvatarColor(member.username)}`}>
                                        {getInitials(member.username)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                          {formatUsername(member.username)}
                                          {formData.assignTo === member.id.toString() && (
                                            <Check size={16} className="text-indigo-600" />
                                          )}
                                        </div>
                                        <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${roleInfo.color}`}>
                                          {roleInfo.label}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

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