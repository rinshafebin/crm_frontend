import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/layouts/Navbar';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BATCH_CHOICES = [
  { value: 'A1', label: 'A1 (Beginner)' },
  { value: 'A2', label: 'A2 (Elementary)' },
  { value: 'B1', label: 'B1 (Intermediate)' },
  { value: 'B2', label: 'B2 (Upper Intermediate)' },
  { value: 'A1 ONLINE', label: 'A1 (Online)' },
  { value: 'A2 ONLINE', label: 'A2 (Online)' },
  { value: 'B1 ONLINE', label: 'B1 (Online)' },
  { value: 'B2 ONLINE', label: 'B2 (Online)' },
  { value: 'A1 EXAM PREPERATION', label: 'A1 (Exam Preparation)' },
  { value: 'A2 EXAM PREPERATION', label: 'A2 (Exam Preparation)' },
  { value: 'B1 EXAM PREPERATION', label: 'B1 (Exam Preparation)' },
  { value: 'B2 EXAM PREPERATION', label: 'B2 (Exam Preparation)' },
];

const STATUS_CHOICES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
];

const CLASS_CHOICES = [
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
  { value: 'C5', label: 'C5' },
  { value: 'C6', label: 'C6' },
  { value: 'C7', label: 'C7' },
  { value: 'C8', label: 'C8' },
  { value: 'C9', label: 'C9' },
  { value: 'C10', label: 'C10' },
  { value: 'C11', label: 'C11' },
  { value: 'C12', label: 'C12' },
  { value: 'C13', label: 'C13' },
  { value: 'C14', label: 'C14' },
  { value: 'C15', label: 'C15' },
  { value: 'C16', label: 'C16' },
  { value: 'C17', label: 'C17' },
  { value: 'C18', label: 'C18' },
  { value: 'C19', label: 'C19' },
  { value: 'C20', label: 'C20' },
  { value: 'ONLINE', label: 'Online' },
];

export default function AddStudentPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    trainer: '',
    status: 'ACTIVE',
    admission_date: new Date().toISOString().split('T')[0],
    student_class: '',
    email: '',
    phone_number: '',
    drive_link: '',
    notes: '',
  });

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setTrainersLoading(true);
        let token = accessToken || await refreshAccessToken();
        if (!token) {
          console.error('No token available');
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/trainers/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        let trainersData = [];
        if (res.data.results) {
          trainersData = res.data.results;
        } else if (Array.isArray(res.data)) {
          trainersData = res.data;
        } else {
          console.error('Unexpected response format:', res.data);
        }
        setTrainers(trainersData);
      } catch (err) {
        console.error('Failed to load trainers:', err);
        console.error('Error response:', err.response?.data);
      } finally {
        setTrainersLoading(false);
      }
    };

    fetchTrainers();
  }, [accessToken, refreshAccessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.batch) {
      newErrors.batch = 'Batch is required';
    }
    if (!formData.trainer) {
      newErrors.trainer = 'Trainer is required';
    }
    if (!formData.admission_date) {
      newErrors.admission_date = 'Admission date is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.phone_number && formData.phone_number.length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Clean up empty fields
      const submitData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      await axios.post(`${API_BASE_URL}/students/`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Success - navigate back to students list
      navigate('/students');
    } catch (err) {
      console.error('Failed to create student', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data) {
        // Handle backend validation errors
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ submit: 'Failed to create student. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600 mt-2">Fill in the student information below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch <span className="text-red-500">*</span>
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.batch ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Batch</option>
                {BATCH_CHOICES.map((batch) => (
                  <option key={batch.value} value={batch.value}>
                    {batch.label}
                  </option>
                ))}
              </select>
              {errors.batch && (
                <p className="mt-1 text-sm text-red-500">{errors.batch}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                name="student_class"
                value={formData.student_class}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Class</option>
                {CLASS_CHOICES.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trainer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trainer <span className="text-red-500">*</span>
              </label>
              <select
                name="trainer"
                value={formData.trainer}
                onChange={handleChange}
                disabled={trainersLoading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.trainer ? 'border-red-500' : 'border-gray-300'
                } ${trainersLoading ? 'bg-gray-100' : ''}`}
              >
                <option value="">
                  {trainersLoading ? 'Loading trainers...' : 'Select Trainer'}
                </option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.user_name || `${trainer.user?.first_name || ''} ${trainer.user?.last_name || ''}`.trim() || trainer.email || `Trainer ${trainer.id}`}
                  </option>
                ))}
              </select>
              {errors.trainer && (
                <p className="mt-1 text-sm text-red-500">{errors.trainer}</p>
              )}
              {trainers.length === 0 && !trainersLoading && (
                <p className="mt-1 text-sm text-yellow-600">No trainers available</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_CHOICES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.admission_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.admission_date && (
                <p className="mt-1 text-sm text-red-500">{errors.admission_date}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="student@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567890"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>
              )}
            </div>

            {/* Drive Link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Link
              </label>
              <input
                type="url"
                name="drive_link"
                value={formData.drive_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://drive.google.com/..."
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes about the student..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || trainersLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}