import React, { useEffect, useState, useCallback } from 'react';
import axios from "axios";
import Navbar from '../Components/layouts/Navbar';
import { Plus } from 'lucide-react';
import StatsCards from '../Components/students/StatsCards';
import SearchFilters from '../Components/students/SearchFilters';
import StudentGrid from '../Components/students/StudentGrid';
import Pagination from '../Components/students/Pagination';
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentsPage() {
  const { accessToken, refreshAccessToken } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      let token = accessToken;
      if (!token) {
        token = await refreshAccessToken();
      }

      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/students/`, {
        params: {
          search: searchTerm || undefined,
          course: filterCourse !== "all" ? filterCourse : undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          page,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // DRF pagination safe
      setStudents(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, searchTerm, filterCourse, filterStatus, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
            <p className="text-gray-600 mt-2">Manage student enrollments and track progress</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <Plus size={20} />
            Add New Student
          </button>
        </div>

        <StatsCards />

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          courses={[
            'Web Development',
            'Data Science',
            'Mobile Development',
            'UI/UX Design',
            'Cloud Computing',
            'Cybersecurity',
          ]}
        />

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading students…
          </div>
        ) : (
          <StudentGrid students={students} />
        )}

        <Pagination page={page} setPage={setPage} />
      </div>
    </div>
  );
}
