import React, { useState, useEffect, useCallback } from "react";
import StaffHeader from "../Components/staffs/newstaff/StaffHeader";
import StaffActionButtons from "../Components/staffs/newstaff/StaffActionButtons";
import PersonalInfoSection from "../Components/staffs/newstaff/PersonalInfoSection";
import ProfessionalInfoSection from "../Components/staffs/newstaff/ProfessionalInfoSection";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditStaffPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    team: '',
    salary: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/staffs/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          console.error('Failed to fetch staff details');
          navigate('/staff');
          return;
        }

        const data = await res.json();
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          role: data.role || '',
          salary: data.salary || '',
          team: data.team || '',
          isActive: data.is_active ?? true
        });
        setLoading(false);
      } catch (err) {
        console.error('Network error:', err);
        navigate('/staff');
      }
    };

    fetchStaffDetails();
  }, [id, API_BASE_URL, accessToken, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const staffData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      role: formData.role,
      team: formData.team,
      salary: formData.salary, 
      is_active: formData.isActive,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/staffs/${id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(staffData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to update staff:', errorData);
        setErrors(errorData);
        return;
      }

      const data = await res.json();
      console.log('Staff updated:', data);

      setSubmitted(true);
      setTimeout(() => {
        navigate('/staff');
      }, 1500);

    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const handleBack = () => {
    const confirmed = window.confirm(
      'Are you sure you want to go back? Any unsaved changes will be lost.'
    );
    if (confirmed) {
      navigate('/staff');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StaffHeader onBack={handleBack} title="Edit Staff Member" subtitle="Update staff member details" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                  Staff member updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />

          <ProfessionalInfoSection
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />

          <StaffActionButtons
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isEdit={true}
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
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. Password cannot be changed from this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}