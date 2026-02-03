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
  const [apiError, setApiError] = useState('');

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
        
        // Handle different possible structures for assigned_to
        let assignedToValue = '';
        if (lead.assigned_to) {
          if (typeof lead.assigned_to === 'object' && lead.assigned_to !== null) {
            assignedToValue = lead.assigned_to.id ? String(lead.assigned_to.id) : '';
          } else if (typeof lead.assigned_to === 'number') {
            assignedToValue = String(lead.assigned_to);
          } else if (typeof lead.assigned_to === 'string') {
            assignedToValue = lead.assigned_to;
          }
        }

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
        setApiError('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadData();
    }
  }, [leadId, authFetch, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
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
    setApiError('');

    // Parse assignedTo properly
    let assignedToValue = null;
    if (formData.assignedTo && formData.assignedTo !== '') {
      const parsed = parseInt(formData.assignedTo, 10);
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
    };

    try {
      // Step 1: Update the lead details
      const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Handle backend validation errors
        if (responseData && typeof responseData === 'object') {
          const backendErrors = {};
          
          // Map backend field names to frontend field names
          Object.keys(responseData).forEach(key => {
            if (Array.isArray(responseData[key])) {
              backendErrors[key] = responseData[key][0]; // Take first error message
            } else if (typeof responseData[key] === 'string') {
              backendErrors[key] = responseData[key];
            }
          });
          
          setErrors(backendErrors);
          
          // Set a general error message if no specific field errors
          if (Object.keys(backendErrors).length === 0) {
            setApiError(responseData?.detail || responseData?.message || 'Failed to update lead');
          }
        }
        throw new Error('Validation failed');
      }

      // Step 2: Handle assignment separately
      if (assignedToValue !== null) {
        const assignPayload = {
          lead_id: parseInt(leadId),
          assigned_to_id: assignedToValue
        };

        const assignRes = await authFetch(`${API_BASE_URL}/leads/assign/`, {
          method: 'POST',
          body: JSON.stringify(assignPayload)
        });

        if (!assignRes.ok) {
          const assignData = await assignRes.json();
          const errorMsg = assignData?.error || assignData?.detail || 'Unknown error';
          setApiError(`Lead updated but assignment failed: ${errorMsg}`);
          return; // Don't redirect on assignment failure
        }
      } else {
        // Step 3: Unassign if assignedTo is null/empty
        const unassignPayload = {
          lead_id: parseInt(leadId),
          unassign_type: 'PRIMARY'
        };

        const unassignRes = await authFetch(`${API_BASE_URL}/leads/unassign/`, {
          method: 'POST',
          body: JSON.stringify(unassignPayload)
        });

        if (!unassignRes.ok) {
          const unassignData = await unassignRes.json();
          const errorMsg = unassignData?.error || unassignData?.detail || 'Unknown error';
          setApiError(`Lead updated but unassignment failed: ${errorMsg}`);
          return; // Don't redirect on unassignment failure
        }
      }

      // Success!
      setSubmitted(true);
      setTimeout(() => {
        navigate('/leads');
      }, 2000);

    } catch (err) {
      if (err.message !== 'Validation failed') {
        setApiError(err.message || 'Something went wrong while updating the lead');
      }
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

        {/* API Error Message */}
        {apiError && (
          <Alert
            type="error"
            title="Error"
            message={apiError}
            className="mb-6"
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