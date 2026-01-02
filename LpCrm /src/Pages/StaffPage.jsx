import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

import StaffHeader from '../Components/staff/StaffHeader';
import StaffStats from '../Components/staff/StaffStats';
import StaffFilters from '../Components/staff/StaffFilters';
import StaffGrid from '../Components/staff/StaffGrid';
import StaffPagination from '../Components/staff/StaffPagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StaffPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken, loading: authLoading, isAuthenticated } = useAuth();

  const [staffMembers, setStaffMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  /* ---------------- AUTH FETCH ---------------- */
  const authFetch = useCallback(
    async (url, options = {}, retry = true) => {
      const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error('Session expired');
        return authFetch(url, options, false);
      }
      return res;
    },
    [accessToken, refreshAccessToken]
  );

  /* ---------------- FETCH STAFF ---------------- */
  const fetchStaff = useCallback(
    async (page = 1, search = '') => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({ page });
        if (search) params.append('search', search);

        const res = await authFetch(`${API_BASE_URL}/staffs/?${params}`);
        const data = await res.json();

        const mapped = data.results.map((staff) => ({
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.username,
          role: staff.role,
          department: staff.team || 'Unassigned',
          email: staff.email,
          phone: staff.phone,
          location: staff.location,
          status: staff.is_active ? 'active' : 'inactive',
          joinDate: new Date(staff.date_joined).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.username}`,
        }));

        setStaffMembers(mapped);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
        });
      } finally {
        setLoading(false);
      }
    },
    [accessToken, authFetch]
  );

  useEffect(() => {
    if (!authLoading && accessToken) fetchStaff(1, searchTerm);
  }, [authLoading, accessToken]);

  useEffect(() => {
    const t = setTimeout(() => fetchStaff(1, searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ---------------- DERIVED DATA ---------------- */
  const filteredStaff = useMemo(() => {
    if (filterDepartment === 'all') return staffMembers;
    return staffMembers.filter(s => s.department === filterDepartment);
  }, [staffMembers, filterDepartment]);

  const departments = useMemo(
    () => [...new Set(staffMembers.map(s => s.department))].filter(d => d !== 'Unassigned'),
    [staffMembers]
  );

  const totalPages = Math.ceil(pagination.count / 10);

  /* ---------------- DELETE ---------------- */
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await authFetch(`${API_BASE_URL}/staffs/${id}/delete/`, { method: 'DELETE' });
    fetchStaff(pagination.currentPage, searchTerm);
  }, [authFetch, fetchStaff, pagination.currentPage, searchTerm]);

  if (authLoading) return <div className="p-10 text-center">Checking session…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <StaffHeader onAdd={() => navigate('/staff/create')} />

        <StaffStats staff={staffMembers} total={pagination.count} />

        <StaffFilters
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          department={filterDepartment}
          onDepartmentChange={setFilterDepartment}
          departments={departments}
        />

        <StaffGrid
          loading={loading}
          staff={filteredStaff}
          onView={(id) => navigate(`/staff/${id}`)}
          onEdit={(id) => navigate(`/staff/${id}/edit`)}
          onDelete={handleDelete}
        />

        <StaffPagination
          totalPages={totalPages}
          pagination={pagination}
          onPrev={() => fetchStaff(pagination.currentPage - 1, searchTerm)}
          onNext={() => fetchStaff(pagination.currentPage + 1, searchTerm)}
          onPage={(p) => fetchStaff(p, searchTerm)}
        />
      </div>
    </div>
  );
}
