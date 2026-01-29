import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Tag, FileText, TrendingUp, Calendar, Loader2, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statusOptions, sourceOptions, priorityOptions, programOptions } from '../Components/utils/leadConstants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditLeadPage() {
  const { accessToken, refreshAccessToken } = useAuth();
  const { id: leadId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    priority: 'MEDIUM',
    status: 'ENQUIRY',
    program: '',
    source: '',
    customSource: '',
    remarks: '',
    assignedTo: ''  // Add assignedTo field
  });

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Only sales and admission roles
  const ALLOWED_ROLES = ['ADM_MANAGER', 'ADM_EXEC', 'FOE', 'CM', 'BDM'];

  const formatRole = (role) => {
    const roleMap = {
      'ADM_MANAGER': 'Admission Manager',
      'ADM_EXEC': 'Admission Executive',
      'FOE': 'Front Office Executive',
      'CM': 'Center Manager',
      'BDM': 'Business Development Manager',
    };
    return roleMap[role] || role;
  };

  // Auth fetch with token refresh
  const authFetch = useCallback(async (url, options = {}, retry = true) => {
    if (!accessToken) throw new Error('No access token');

    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error('Session expired');
      return authFetch(url, options, false);
    }

    return res;
  }, [accessToken, refreshAccessToken]);

  // Fetch available users (sales team only)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/staff/`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        
        // Filter to only sales/admission roles
        const filteredUsers = (data.results || data).filter(user =>
          user.is_active && ALLOWED_ROLES.includes(user.role)
        );

        // Sort by role, then by name
        const sortedUsers = filteredUsers.sort((a, b) => {
          const roleIndexA = ALLOWED_ROLES.indexOf(a.role);
          const roleIndexB = ALLOWED_ROLES.indexOf(b.role);
          
          if (roleIndexA !== roleIndexB) {
            return roleIndexA - roleIndexB;
          }
          
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setUsers(sortedUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken, authFetch]);

  // Fetch lead data
  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        const lead = await res.json();

        setFormData({
          name: lead.name || '',
          phone: lead.phone || '',
          email: lead.email || '',
          location: lead.location || '',
          priority: lead.priority || 'MEDIUM',
          status: lead.status || 'ENQUIRY',
          program: lead.program || '',
          source: lead.source || '',
          customSource: lead.custom_source || '',
          remarks: lead.remarks || '',
          // Get assigned_to ID from the nested object
          assignedTo: lead.assigned_to?.id || ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load lead data');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && leadId) {
      fetchLeadData();
    }
  }, [leadId, accessToken, authFetch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : value
    }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 3) 
      newErrors.name = 'Name must be at least 3 characters long';

    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(formData.phone.trim()))
      newErrors.phone = 'Phone number must be at least 10 digits';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = 'Email is invalid';
    
    if (!formData.source) newErrors.source = 'Source is required';
    
    if (formData.source === 'OTHER' && !formData.customSource?.trim())
      newErrors.customSource = 'Please specify custom source';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || null,
      location: formData.location?.trim() || null,
      priority: formData.priority,
      status: formData.status,
      program: formData.program || null,
      source: formData.source,
      custom_source: formData.source === 'OTHER' ? formData.customSource.trim() : '',
      remarks: formData.remarks?.trim() || '',
      assigned_to: formData.assignedTo ? parseInt(formData.assignedTo) : null
    };

    // Remove null/empty email
    if (!payload.email) {
      delete payload.email;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Update failed:', errorData);
        
        // Handle validation errors
        if (errorData.phone) {
          setErrors(prev => ({ ...prev, phone: errorData.phone[0] }));
        }
        if (errorData.email) {
          setErrors(prev => ({ ...prev, email: errorData.email[0] }));
        }
        
        throw new Error('Failed to update lead');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/leads'), 1500);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating lead');
    }
  };

  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Unsaved changes will be lost.')) {
      navigate('/leads');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lead data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Leads</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
          <p className="text-gray-600 mt-1">Update lead information in your CRM</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Success Message */}
          {submitted && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <p className="text-green-800 font-medium flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Lead updated successfully!
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="p-6 space-y-8">
            {/* Contact Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1234567890"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Lead Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program/Course
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select a program</option>
                      {programOptions.map(program => (
                        <option key={program.value} value={program.value}>
                          {program.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority Level - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-3">
                    {priorityOptions.map(p => (
                      <label key={p.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p.value}
                          checked={formData.priority === p.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lead Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white ${
                        errors.source ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select source</option>
                      {sourceOptions.map(source => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.source && <p className="mt-1 text-sm text-red-500">{errors.source}</p>}
                </div>

                {/* Custom Source - Show when OTHER is selected */}
                {formData.source === 'OTHER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Source <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customSource"
                      value={formData.customSource}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.customSource ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Specify custom source"
                    />
                    {errors.customSource && <p className="mt-1 text-sm text-red-500">{errors.customSource}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                Assignment
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    disabled={loadingUsers}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} - {formatRole(user.role)}
                      </option>
                    ))}
                  </select>
                  {loadingUsers && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only sales and admission team members are shown
                </p>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Additional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks / Notes
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Add any additional notes or remarks about this lead..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Save size={20} />
                Update Lead
              </button>

              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="m-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. You can update the assignment here or leave it unchanged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}