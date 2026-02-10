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
import { BATCH_CHOICES } from '../Components/utils/studentConstants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      let token = accessToken;
      if (!token) token = await refreshAccessToken();
      if (!token) return;

      // Build params object
      const params = {
        page,
        page_size: 50, // Request 50 items per page
      };

      // Add search if present
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      // Add batch filter if not "all"
      if (filterCourse !== "all") {
        params.batch = filterCourse;
      }

      // Add status filter if not "all" - convert to uppercase
      if (filterStatus !== "all") {
        params.status = filterStatus.toUpperCase();
      }

      const res = await axios.get(`${API_BASE_URL}/students/`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Get students from response
      const studentsData = res.data.results || res.data;
      setStudents(studentsData);

      // Calculate total pages based on 50 items per page
      const totalCount = res.data.count || studentsData.length || 0;
      setTotalPages(Math.ceil(totalCount / 50));
    } catch (err) {
      console.error("Failed to load students", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, debouncedSearch, filterCourse, filterStatus, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle student deletion
  const handleStudentDeleted = useCallback((deletedStudentId) => {
    // Remove the deleted student from the local state
    setStudents(prev => prev.filter(student => student.id !== deletedStudentId));
    
    // Optionally refetch to ensure data is in sync
    // fetchStudents();
  }, []);

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
          <StudentGrid 
            students={students} 
            onStudentDeleted={handleStudentDeleted}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}