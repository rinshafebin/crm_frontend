// src/hooks/useStudentForm.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initialStudentFormData } from '../Components/utils/studentConstants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useStudentForm(studentId = null) {
  const { accessToken, refreshAccessToken } = useAuth();
  
  const [formData, setFormData] = useState(initialStudentFormData);
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch student data if editing
  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  // Fetch trainers
  useEffect(() => {
    fetchTrainers();
  }, [accessToken]);

  const fetchStudent = async () => {
    try {
      setFetchLoading(true);
      let token = accessToken || await refreshAccessToken();
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.get(`${API_BASE_URL}/students/${studentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setFormData(response.data);
      setErrors({});
    } catch (err) {
      console.error('Failed to fetch student:', err);
      setErrors({ submit: 'Failed to load student details' });
    } finally {
      setFetchLoading(false);
    }
  };

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

  const submitStudent = async (onSuccess) => {
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

      // Determine if we're creating or updating
      if (studentId) {
        // Update existing student
        await axios.put(`${API_BASE_URL}/students/${studentId}/`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      } else {
        // Create new student
        await axios.post(`${API_BASE_URL}/students/`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }

      // Success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to save student', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data) {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ submit: `Failed to ${studentId ? 'update' : 'create'} student. Please try again.` });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    trainers,
    trainersLoading,
    loading,
    fetchLoading,
    errors,
    handleChange,
    submitStudent,
  };
}