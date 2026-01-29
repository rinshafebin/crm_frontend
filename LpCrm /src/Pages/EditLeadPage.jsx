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
    assignedTo: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        
        console.log('Lead data received:', lead);
        console.log('Assigned to field:', lead.assigned_to);

        // Handle different possible structures for assigned_to
        let assignedToValue = '';
        if (lead.assigned_to) {
          if (typeof lead.assigned_to === 'object' && lead.assigned_to.id) {
            assignedToValue = String(lead.assigned_to.id);
          } else if (typeof lead.assigned_to === 'number') {
            assignedToValue = String(lead.assigned_to);
          } else if (typeof lead.assigned_to === 'string') {
            assignedToValue = lead.assigned_to;
          }
        }

        console.log('Setting assignedTo to:', assignedToValue);

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
          assignedTo: assignedToValue
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
    console.log(`Input changed: ${name} = ${value}`);
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : value }));
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

    setSubmitting(true);

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

    console.log('Submitting payload:', payload);

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
        if (errorData.assigned_to) {
          setErrors(prev => ({ ...prev, assignedTo: errorData.assigned_to[0] }));
        }
        throw new Error(errorData.detail || 'Failed to update lead');
      }

      const updatedLead = await res.json();
      console.log('✅ Lead updated successfully:', updatedLead);
      console.log('✅ New assigned_to value:', updatedLead.assigned_to);

      setSubmitted(true);
      
      // Wait a bit longer to ensure backend processing is complete
      setTimeout(() => {
        navigate('/leads', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('❌ Update error:', err);
      alert(err.message || 'Error updating lead');
    } finally {
      setSubmitting(false);
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
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
          <span className="text-gray-600">Loading lead data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={submitting}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Leads</span>
            </button>
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
            <p className="text-sm text-gray-600 mt-1">Update lead information in your CRM</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Lead updated successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Location */}
              <div>
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
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      submitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lead Details Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              Lead Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program/Course
                </label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    submitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select a program</option>
                  {programOptions.map(program => (
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    submitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Level - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'priority', value: p.value } })}
                      disabled={submitting}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.priority === p.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.source ? 'border-red-500' : 'border-gray-300'
                  } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select source</option>
                  {sourceOptions.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
                {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
              </div>

              {/* Custom Source - Show when OTHER is selected */}
              {formData.source === 'OTHER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Source *
                  </label>
                  <input
                    type="text"
                    name="customSource"
                    value={formData.customSource}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.customSource ? 'border-red-500' : 'border-gray-300'
                    } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Specify the source"
                  />
                  {errors.customSource && <p className="text-red-500 text-sm mt-1">{errors.customSource}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Assignment Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              Assignment
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                disabled={submitting || loadingUsers}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                } ${(submitting || loadingUsers) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} - {formatRole(user.role)}
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Only sales and admission team members are shown
              </p>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-indigo-600" />
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
                disabled={submitting}
                rows="4"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                  submitting ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Add any additional notes or remarks..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Lead
                </>
              )}
            </button>
            <button
              onClick={handleBack}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Assignment changes will be reflected immediately after updating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}