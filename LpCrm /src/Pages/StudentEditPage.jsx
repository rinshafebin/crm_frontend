import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar';
import axios from 'axios';
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

const CLASS_CHOICES = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
  'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'ONLINE'
];

export default function StudentEditPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [trainers, setTrainers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    student_class: '',
    admission_date: '',
    trainer: '',
    batch: '',
    status: 'ACTIVE',
    notes: '',
    drive_link: '',
  });

  useEffect(() => {
    fetchStudent();
    fetchTrainers();
  }, [id]);

  const fetchTrainers = async () => {
    try {
      let token = accessToken || await refreshAccessToken();
      const response = await axios.get(`${API_BASE_URL}/trainers/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setTrainers(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
    }
  };

  const fetchStudent = async () => {
    try {
      setLoading(true);
      let token = accessToken || await refreshAccessToken();
      
      const response = await axios.get(`${API_BASE_URL}/students/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      setFormData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch student:', err);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let token = accessToken || await refreshAccessToken();
      
      await axios.put(
        `${API_BASE_URL}/students/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // Navigate back to students list on success
      navigate('/students');
    } catch (err) {
      console.error('Failed to update student:', err);
      alert('Failed to update student. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading student details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Students
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch *
                  </label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Batch</option>
                    {BATCH_CHOICES.map((batch) => (
                      <option key={batch.value} value={batch.value}>
                        {batch.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    name="student_class"
                    value={formData.student_class || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Class</option>
                    {CLASS_CHOICES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trainer *
                  </label>
                  <select
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.user.first_name} {trainer.user.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Drive Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Link
              </label>
              <input
                type="url"
                name="drive_link"
                value={formData.drive_link || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://drive.google.com/..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes about the student..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}