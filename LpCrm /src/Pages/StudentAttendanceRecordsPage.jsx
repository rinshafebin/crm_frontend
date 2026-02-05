// StudentAttendanceRecordsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Download, ArrowLeft, CheckCircle, XCircle, Clock, User, TrendingUp } from 'lucide-react';
import Navbar from '../Components/layouts/Navbar';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusConfig = {
  PRESENT: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  ABSENT: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  LATE: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
};

export default function StudentAttendanceRecordsPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });

  // Debug: Log studentId to verify it's being captured
  useEffect(() => {
    console.log('Student ID from params:', studentId);
    if (!studentId || studentId === ':studentId') {
      console.error('Invalid student ID! Check your route configuration.');
    }
  }, [studentId]);

  // Fetch student details
  const fetchStudent = useCallback(async () => {
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/students/${studentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (err) {
      console.error('Failed to load student', err);
    }
  }, [studentId, accessToken, refreshAccessToken]);

  // Fetch attendance records
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/attendance/student/${studentId}/?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        const recordsList = data.results || data;
        setRecords(recordsList);

        // Calculate stats
        const total = recordsList.length;
        const present = recordsList.filter(r => r.status === 'PRESENT').length;
        const absent = recordsList.filter(r => r.status === 'ABSENT').length;
        const late = recordsList.filter(r => r.status === 'LATE').length;
        setStats({ total, present, absent, late });

        const totalCount = data.count || recordsList.length;
        setTotalPages(Math.ceil(totalCount / 10));
      }
    } catch (err) {
      console.error('Failed to load attendance records', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, page, accessToken, refreshAccessToken]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Export attendance to CSV
  const handleExport = async () => {
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/attendance/export/${studentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_${studentId}_attendance.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to export attendance', err);
    }
  };

  // Calculate attendance percentage
  const attendancePercentage = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/students')}
          className="mb-6 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md border border-gray-200 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Students
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {student && (
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                  alt={student.name}
                  className="w-16 h-16 rounded-xl bg-gray-200 shadow-md"
                />
              )}
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {student ? student.name : 'Loading...'}
                </h1>
                <p className="text-gray-600 text-lg">Attendance Records</p>
                {student && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Batch {student.batch}</span>
                    <span className="text-gray-400">•</span>
                    <span>{student.student_class}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Days</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Late</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-semibold">Attendance</p>
                <p className="text-3xl font-bold">{attendancePercentage}%</p>
              </div>
              <TrendingUp className="text-indigo-100" size={32} />
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-indigo-600" />
              Attendance History
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No attendance records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Trainer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record, idx) => {
                      const config = statusConfig[record.status] || statusConfig.PRESENT;
                      const Icon = config.icon;

                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="text-gray-700">
                                {record.trainer?.user?.first_name} {record.trainer?.user?.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${config.color}`}>
                              <Icon size={16} />
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}