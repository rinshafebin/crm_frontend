// Pages/AddLeadPage.jsx - REFACTORED
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LeadHeader from '../Components/leads/newlead/LeadHeader';
import ContactInfoSection from '../Components/leads/newlead/ContactSection';
import LeadDetailsSection from '../Components/leads/newlead/LeadDetailsSection';
import AdditionalInfoSection from '../Components/leads/newlead/AdditionalInfoSection';
import ActionButtons from '../Components/leads/newlead/ActionButtons';
import Alert from '../Components/common/Alert';
import Card from '../Components/common/Card';

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
    if (confirmed) navigate('/leads');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadHeader onBack={handleBack} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <Alert 
            type="success" 
            title="Lead added successfully!" 
            className="mb-6 animate-pulse"
          />
        )}

        {/* Form Card */}
        <Card padding="p-8">
          <ContactInfoSection formData={formData} errors={errors} onChange={handleInputChange} />
          <LeadDetailsSection formData={formData} errors={errors} onChange={handleInputChange} />
          <AdditionalInfoSection formData={formData} onChange={handleInputChange} />
          <ActionButtons onSave={handleSubmit} onCancel={handleBack} />
        </Card>

        {/* Info Alert */}
        <Alert 
          type="info" 
          className="mt-6"
        >
          <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Make sure to fill them before saving the lead.
        </Alert>
      </div>
    </div>
  );
}