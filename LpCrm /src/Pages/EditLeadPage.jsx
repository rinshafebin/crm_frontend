import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ContactSection from '../Components/leads/newlead/ContactSection';
import LeadDetailsSection from '../Components/leads/newlead/LeadDetailsSection';
import AdditionalInfoSection from '../Components/leads/newlead/AdditionalInfoSection';
import AssignedToSection from '../Components/leads/newlead/AssignedToSection';
import Alert from '../Components/common/Alert';
import Card from '../Components/common/Card';
import Button from '../Components/common/Button';
import { Save } from 'lucide-react';

export default function EditLeadPage() {
  const { accessToken, refreshAccessToken } = useAuth();
  const { id: leadId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // Auth fetch with token refresh
  const authFetch = useCallback(async (url, options = {}, retry = true) => {
    let token = accessToken;
    
    if (!token) {
      token = await refreshAccessToken();
      if (!token) throw new Error('No access token available');
    }

    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error('Session expired');
      return authFetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } }, false);
    }

    return res;
  }, [accessToken, refreshAccessToken]);

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
          if (typeof lead.assigned_to === 'object' && lead.assigned_to !== null) {
            // If it's an object with an id property
            assignedToValue = lead.assigned_to.id ? String(lead.assigned_to.id) : '';
          } else if (typeof lead.assigned_to === 'number') {
            // If it's a number, convert to string
            assignedToValue = String(lead.assigned_to);
          } else if (typeof lead.assigned_to === 'string') {
            // If it's already a string
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
        console.error('Error fetching lead:', err);
        alert('Failed to load lead data');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadData();
    }
  }, [leadId, authFetch, navigate, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }
    
    if (formData.source === 'OTHER' && !formData.customSource?.trim()) {
      newErrors.customSource = 'Please specify custom source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // CRITICAL FIX: Parse assignedTo properly - handle empty string case
    let assignedToValue = null;
    if (formData.assignedTo && formData.assignedTo !== '') {
      const parsed = parseInt(formData.assignedTo, 10);
      // Only set if it's a valid number
      if (!isNaN(parsed)) {
        assignedToValue = parsed;
      }
    }

    // Prepare the payload
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
      assigned_to: assignedToValue,  // This will be either a valid integer or null
    };

    console.log('Submitting payload:', payload);
    console.log('assigned_to value:', payload.assigned_to, 'type:', typeof payload.assigned_to);

    try {
      const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error('Update error:', responseData);
        
        // Check for specific error messages
        if (responseData.assigned_to) {
          setErrors(prev => ({ ...prev, assignedTo: responseData.assigned_to[0] }));
        }
        
        throw new Error(responseData?.detail || responseData?.message || 'Failed to update lead');
      }

      console.log('Lead updated successfully:', responseData);
      setSubmitted(true);

      // Show success message and redirect
      setTimeout(() => {
        navigate('/leads');
      }, 2000);

    } catch (err) {
      console.error('Update lead error:', err);
      alert(err.message || 'Something went wrong while updating the lead');
    } finally {
      setSubmitting(false);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading lead details...</p>
        </div>
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
              disabled={submitting}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
              <p className="text-sm text-gray-600">Update the lead information below</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <Alert
            type="success"
            title="Lead updated successfully!"
            message="Redirecting to leads page..."
            className="mb-6 animate-pulse"
          />
        )}

        {/* Form Card */}
        <Card padding="p-8">
          <ContactSection 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          
          <LeadDetailsSection 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          
          <AssignedToSection 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          
          <AdditionalInfoSection 
            formData={formData} 
            onChange={handleInputChange} 
          />

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSubmit}
              variant="primary"
              icon={Save}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Lead'}
            </Button>
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </Card>

        {/* Info Alert */}
        <Alert
          type="info"
          className="mt-6"
        >
          <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Assignment changes will be reflected immediately after updating.
        </Alert>
      </div>
    </div>
  );
}