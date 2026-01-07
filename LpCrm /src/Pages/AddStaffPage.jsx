// src/pages/AddStaffPage.jsx
import React, { useState } from 'react';
import StaffHeader from '../Components/staffs/newstaff/StaffHeader';
import PersonalInfoSection from '../Components/staffs/newstaff/ PersonalInfoSection'
import ProfessionalInfoSection from '../Components/staffs/newstaff/ PersonalInfoSection'
import SecuritySection from '../Components/staffs/newstaff/SecuritySection'
import StaffActionButtons from '../Components/staffs/newstaff/StaffActionButtons'
import { initialFormData } from '../Components/utils/staffConstants'

export default function AddStaffPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
    if (!formData.team) newErrors.team = 'Team is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const staffData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      role: formData.role,
      team: formData.team,
      date_joined: formData.dateJoined,
      is_active: formData.isActive,
      password: formData.password
    };

    console.log('Staff Data Submitted:', staffData);

    setSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData(initialFormData);
      setSubmitted(false);
    }, 2000);
  };

  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      console.log('Navigating back to staff page');
      // In real app: navigate('/staff')
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StaffHeader onBack={handleBack} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Staff member added successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
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

          <SecuritySection 
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />

          <StaffActionButtons 
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required. The staff member will receive login credentials via email once their account is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}