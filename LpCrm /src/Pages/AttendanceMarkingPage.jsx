// AttendanceMarkingPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, Clock, Save, Users, AlertCircle } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusOptions = [
  { value: 'PRESENT', label: 'Present', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  { value: 'ABSENT', label: 'Absent', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  { value: 'LATE', label: 'Late', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
];

export default function AttendanceMarkingPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch students for the trainer
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      let token = accessToken || await refreshAccessToken();
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/students/?status=ACTIVE`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await res.json();
      const studentsList = data.results || data;
      setStudents(studentsList);
      
      // Initialize attendance records with default PRESENT
      const initialRecords = {};
      studentsList.forEach(student => {
        initialRecords[student.id] = 'PRESENT';
      });
      setAttendanceRecords(initialRecords);
    } catch (err) {
      console.error('Failed to load students', err);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle attendance status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Submit attendance
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setMessage(null);

      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student: parseInt(studentId),
        status: status
      }));

      const res = await fetch(`${API_BASE_URL}/attendance/quick-mark/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          records: records
        })
      });

      if (!res.ok) throw new Error('Failed to save attendance');

      setMessage({ 
        type: 'success', 
        text: `Attendance marked successfully for ${records.length} students on ${selectedDate}` 
      });
    } catch (err) {
      console.error('Failed to save attendance', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to save attendance. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Quick mark all as present
  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(student => {
      allPresent[student.id] = 'PRESENT';
    });
    setAttendanceRecords(allPresent);
  };

  // Get status counts
  const getStatusCounts = () => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    Object.values(attendanceRecords).forEach(status => {
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mark Attendance
          </h1>
          <p className="text-gray-600 text-lg">Quick attendance marking for all students</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <AlertCircle size={20} />
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Date Selection & Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-indigo-600" size={20} />
                <label className="text-gray-700 font-semibold">Date:</label>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <button
              onClick={markAllPresent}
              className="px-6 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold flex items-center gap-2 border border-green-300"
            >
              <CheckCircle size={18} />
              Mark All Present
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Present</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.PRESENT}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Absent</p>
                <p className="text-3xl font-bold text-red-600">{statusCounts.ABSENT}</p>
              </div>
              <XCircle className="text-red-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Late</p>
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.LATE}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={24} className="text-indigo-600" />
              Student Attendance ({students.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No active students found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                        alt={student.name}
                        className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Batch {student.batch}</span>
                          <span className="text-gray-400">•</span>
                          <span>{student.student_class}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = attendanceRecords[student.id] === option.value;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(student.id, option.value)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
                              isSelected
                                ? option.color + ' shadow-md scale-105'
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            <Icon size={16} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Submit Button */} 
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={saving || students.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={24} />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}