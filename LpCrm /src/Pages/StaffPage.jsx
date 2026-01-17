import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Pagination from '../Components/common/Pagination';

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Auth fetch wrapper
  const authFetch = useCallback(
    async (url, options = {}, retry = true) => {
      if (!accessToken) throw new Error('No access token');

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

  const fetchStaff = useCallback(
    async (page = 1, search = '', team = '') => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (team && team !== 'all') queryParams.append('team', team);
        queryParams.append('page', page);

        const res = await authFetch(`${API_BASE_URL}/staff/team/?${queryParams.toString()}`);
        const data = await res.json();

        const mappedStaff = data.results.map((staff) => ({
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.username,
          role: staff.role
            ?.replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()),
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

        setStaffMembers(mappedStaff);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
        });
      } catch (err) {
        console.error('Failed to load staff:', err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, authFetch]
  );


  useEffect(() => {
    if (authLoading || !accessToken) return;
    fetchStaff(1, searchTerm, filterDepartment);
  }, [authLoading, accessToken, filterDepartment]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading && accessToken) {
        fetchStaff(1, searchTerm, filterDepartment);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterDepartment, accessToken, authLoading]);

  // Delete staff member
  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await authFetch(`${API_BASE_URL}/staffs/${staffId}/delete/`, {
        method: 'DELETE',
      });

      fetchStaff(pagination.currentPage, searchTerm, filterDepartment);
      alert('Staff member deleted successfully');
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert('Failed to delete staff member');
    }
  };

  // Departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set(staffMembers.map((s) => s.department));
    return Array.from(depts).filter((d) => d !== 'Unassigned');
  }, [staffMembers]);

  // Stats cards
  const stats = useMemo(() => {
    const activeCount = staffMembers.filter((s) => s.status === 'active').length;
    const inactiveCount = staffMembers.filter((s) => s.status === 'inactive').length;

    return [
      { label: 'Total Staff', value: pagination.count.toString(), color: 'from-violet-500 to-purple-600', icon: Users, bgIcon: 'bg-violet-100', iconColor: 'text-violet-600' },
      { label: 'Active', value: activeCount.toString(), color: 'from-emerald-500 to-green-600', icon: CheckCircle, bgIcon: 'bg-emerald-100', iconColor: 'text-emerald-600' },
      { label: 'On Leave', value: '0', color: 'from-amber-500 to-orange-600', icon: Clock, bgIcon: 'bg-amber-100', iconColor: 'text-amber-600' },
      { label: 'Inactive', value: inactiveCount.toString(), color: 'from-rose-500 to-red-600', icon: XCircle, bgIcon: 'bg-rose-100', iconColor: 'text-rose-600' },
    ];
  }, [staffMembers, pagination.count]);

  // Pagination handlers
  const handlePageClick = (page) => {
    fetchStaff(page, searchTerm, filterDepartment);
  };

  if (authLoading) return <div className="p-10 text-center">Checking session…</div>;

  const totalPages = Math.ceil(pagination.count / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Gradient */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Staff Management
              </h1>
              <p className="text-slate-600 mt-2 text-lg">Manage your team members and their roles</p>
            </div>
            <button
              onClick={() => navigate('/staff/create')}
              className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Modern Stats Cards with Gradient */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-4xl font-bold text-slate-900 mt-3">{stat.value}</h3>
                    </div>
                    <div className={`${stat.bgIcon} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={stat.iconColor} size={28} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name, role, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-700"
              />
            </div>

            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-700 font-medium bg-white cursor-pointer min-w-[200px]"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / No Staff */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="text-slate-500 mt-4 text-lg">Loading staff members…</p>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <Users size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No staff members found</p>
          </div>
        ) : (
          <>
            {/* Staff Cards - Original Style with Modern Touch */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffMembers.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-indigo-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src={staff.avatar} alt={staff.name} className="w-16 h-16 rounded-full bg-gray-200 ring-2 ring-slate-100" />
                        <div>
                          <h3 className="font-bold text-gray-900">{staff.name}</h3>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {staff.role}
                          </span>
                        </div>
                      </div>

                      {staff.status === 'active' ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <UserCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <UserX size={12} /> Inactive
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                        {staff.department}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        {staff.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{staff.location}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">Joined: {staff.joinDate}</div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/staff/edit/${staff.id}`)}
                        className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageClick}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}