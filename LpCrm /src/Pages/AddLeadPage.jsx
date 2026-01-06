import React, { useState } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Tag, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function AddLeadPage() {
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

  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  const statusOptions = [
    { value: 'ENQUIRY', label: 'Enquiry' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'CONVERTED', label: 'Converted' },
    { value: 'LOST', label: 'Lost' }
  ];
  
  const sourceOptions = [
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'WEBSITE', label: 'Website' },
    { value: 'WALK_IN', label: 'Walk-in' },
    { value: 'AUTOMATION', label: 'Automation' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  const priorityOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];
  
  const programOptions = [
    'Blockchain Development',
    'Digital Marketing',
    'UI/UX Design',
    'Web Development',
    'Data Science',
    'Mobile App Development',
    'Cloud Computing',
    'Cybersecurity'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 3)
      newErrors.name = 'Name must be at least 3 characters long';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(formData.phone.trim()))
      newErrors.phone = 'Phone number must be at least 10 digits and digits only';

    if (!formData.source) newErrors.source = 'Source is required';
    if (formData.source === 'OTHER' && !formData.customSource.trim())
      newErrors.customSource = 'Please specify custom source';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validateForm()) return; 

    const leadData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      source: formData.source,
      custom_source: formData.source === 'OTHER' ? formData.customSource.trim() : '',
      email: formData.email?.trim() || null,
      program: formData.program || null,
      location: formData.location?.trim() || null,
      priority: formData.priority,
      status: formData.status,
      remarks: formData.remarks?.trim() || '',
    };

    try {
      let token = accessToken;
      if (!token) token = await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${API_BASE_URL}/leads/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leadData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.detail || 'Failed to create lead');
      }

      setSubmitted(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
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
        });
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      console.error('Add lead error:', err);
      alert(err.message || 'Something went wrong');
    }
  };



  const handleBack = () => {
    const confirmed = window.confirm(
      'Are you sure you want to go back? Any unsaved changes will be lost.'
    );
    if (confirmed) {
      navigate('/leads');
    }
  };



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
              <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
              <p className="text-sm text-gray-600">Fill in the details to add a new lead to your CRM</p>
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
                  Lead added successfully!
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
                    <option key={program} value={program}>{program}</option>
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
                    <option key={status.value} value={status.value}>{status.label}</option>
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
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${formData.priority === p.value
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
                    <option key={source.value} value={source.value}>{source.label}</option>
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
              Save Lead
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
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Make sure to fill them before saving the lead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}