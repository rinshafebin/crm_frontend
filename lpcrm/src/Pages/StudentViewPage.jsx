import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, BookOpen, Calendar, User, Edit2 } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DROPPED: 'bg-red-100 text-red-700',
};

export default function StudentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      let token = accessToken || await refreshAccessToken();

      const response = await axios.get(
        `${API_BASE_URL}/students/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStudent(response.data);
    } catch (err) {
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
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

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">{error || 'Student not found'}</div>
        </div>
      </div>
    );
  }

  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`;

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

        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={student.name}
                className="w-24 h-24 rounded-full bg-white p-1"
              />
              <div className="text-white">
                <h1 className="text-3xl font-bold">{student.name}</h1>
                <p className="text-indigo-100 mt-1">Student ID: {student.id}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[student.status]}`}>
                {student.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{student.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <BookOpen size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="font-medium">{student.student_class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Admission Date</p>
                      <p className="font-medium">{student.admission_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <User size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Trainer</p>
                      <p className="font-medium">{student.trainer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <BookOpen size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Batch</p>
                      <p className="font-medium">{student.batch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {student.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{student.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
