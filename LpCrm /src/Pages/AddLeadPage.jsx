// src/pages/AddLeadPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LeadHeader from '../Components/leads/newlead/LeadHeader';
import ContactInfoSection from '../Components/leads/newlead/ContactSection';
import LeadDetailsSection from '../Components/leads/newlead/LeadDetailsSection';
import AdditionalInfoSection from '../Components/leads/newlead/AdditionalInfoSection';
import ActionButtons from '../Components/leads/newlead/ActionButtons';

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
      <LeadHeader onBack={handleBack} />

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
          <ContactInfoSection 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />

          <LeadDetailsSection 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />

          <AdditionalInfoSection 
            formData={formData} 
            onChange={handleInputChange} 
          />

          <ActionButtons 
            onSave={handleSubmit} 
            onCancel={handleBack} 
          />
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