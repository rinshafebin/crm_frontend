import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Tag, FileText, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statusOptions, sourceOptions, priorityOptions, programOptions } from '../Components/utils/leadConstants'

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
    remarks: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // --- Auth fetch with token refresh ---
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

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        const lead = await res.json();

        // Check if source is a custom one (not in predefined list)
        const isCustomSource = !sourceOptions.some(opt => opt.value === lead.source);

        setFormData({
          name: lead.name || '',
          phone: lead.phone || '',
          email: lead.email || '',
          location: lead.location || '',
          priority: lead.priority || 'MEDIUM',
          status: lead.status || 'ENQUIRY',
          program: lead.program || '',
          source: isCustomSource ? 'OTHER' : lead.source,
          customSource: isCustomSource ? lead.source : (lead.custom_source || ''),
          remarks: lead.remarks || ''
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [leadId, authFetch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.source) newErrors.source = 'Source is required';
    if (formData.source === 'OTHER' && !formData.customSource.trim()) {
      newErrors.customSource = 'Please specify custom source';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit updated lead to backend ---
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      location: formData.location,
      priority: formData.priority,
      status: formData.status,
      program: formData.program,
      source: formData.source === 'OTHER' ? formData.customSource : formData.source,
      custom_source: formData.source === 'OTHER' ? formData.customSource : '',
      remarks: formData.remarks
    };

    // Remove email if it's empty
    if (!payload.email || payload.email.trim() === '') {
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
        throw new Error('Failed to update lead');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/leads'), 1500);
    } catch (err) {
      console.error(err);
      alert('Error updating lead');
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
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
              <p className="text-sm text-gray-600">Update lead information in your CRM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Lead updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter lead's full name"
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Lead Details Section */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Lead Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Program/Course
                </label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {priorityOptions.map(p => (
                    <label
                      key={p.value}
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.priority === p.value
                          ? p.value === 'HIGH'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : p.value === 'MEDIUM'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p.value}
                        checked={formData.priority === p.value}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source <span className="text-red-500">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.source ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select source</option>
                  {sourceOptions.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
                {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
              </div>

              {/* Custom Source */}
              {formData.source === 'OTHER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Source (Specify) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customSource"
                    value={formData.customSource}
                    onChange={handleInputChange}
                    placeholder="Enter custom source"
                    className={`w-full px-4 py-2 border ${errors.customSource ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.customSource && <p className="text-red-500 text-xs mt-1">{errors.customSource}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                rows="4"
                placeholder="Add any additional notes or remarks about this lead..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Make sure to fill them before updating the lead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}