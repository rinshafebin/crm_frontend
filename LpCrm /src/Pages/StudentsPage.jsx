import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from '../Components/layouts/Navbar';
import { Plus } from 'lucide-react';
import StatsCards from '../Components/students/StatsCards';
import StudentsSearchFilters from '../Components/students/StudentsSearchFilters';
import StudentGrid from '../Components/students/StudentGrid';
import Pagination from '../Components/common/Pagination';
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Batch choices
const BATCH_CHOICES = [
  { value: 'A1', label: 'A1 (Beginner)' },
  { value: 'A2', label: 'A2 (Elementary)' },
  { value: 'B1', label: 'B1 (Intermediate)' },
  { value: 'B2', label: 'B2 (Upper Intermediate)' },
  { value: 'A1 ONLINE', label: 'A1 (Online)' },
  { value: 'A2 ONLINE', label: 'A2 (Online)' },
  { value: 'B1 ONLINE', label: 'B1 (Online)' },
  { value: 'B2 ONLINE', label: 'B2 (Online)' },
  { value: 'A1 EXAM PREPARATION', label: 'A1 (Exam Preparation)' },
  { value: 'A2 EXAM PREPARATION', label: 'A2 (Exam Preparation)' },
  { value: 'B1 EXAM PREPARATION', label: 'B1 (Exam Preparation)' },
  { value: 'B2 EXAM PREPARATION', label: 'B2 (Exam Preparation)' },
];

export default function StudentsPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  // Normalize status to camelCase
  const normalizeStatus = (status) => {
    switch (status) {
      case "ACTIVE": return "active";
      case "COMPLETED": return "completed";
      case "PAUSED":
      case "DROPPED":
      case "INACTIVE":
        return "pausedDropped";
      default: return status.toLowerCase();
    }
  };

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      let token = accessToken;
      if (!token) token = await refreshAccessToken();
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/students/`, {
        params: {
          search: debouncedSearch || undefined,
          course: filterCourse !== "all" ? filterCourse : undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          page,
        },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Normalize statuses to camelCase
      const normalizedStudents = (res.data.results || res.data).map(student => ({
        ...student,
        status: normalizeStatus(student.status),
      }));

      setStudents(normalizedStudents);

      const totalCount = res.data.count || (res.data.results?.length) || normalizedStudents.length || 0;
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, debouncedSearch, filterCourse, filterStatus, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Students Management
              </h1>
              <p className="text-gray-600 text-lg">Manage student enrollments and track progress</p>
            </div>
            <button 
              onClick={() => navigate('/students/add')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <Plus size={20} />
              Add New Student
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Search & Filters */}
        <StudentsSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          courses={BATCH_CHOICES} 
        />

        {/* Student Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading students…</div>
        ) : (
          <StudentGrid students={students} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
