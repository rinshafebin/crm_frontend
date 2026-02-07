import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '../Components/layouts/Navbar';
import LeadsPageHeader from '../Components/leads/LeadsPageHeader';
import LeadsStatsCards from '../Components/leads/LeadsStatsCards';
import LeadsFilters from '../Components/leads/LeadsFilters';
import LeadsTable from '../Components/leads/LeadsTable';
import { Users, UserPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Pagination from '../Components/common/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 50;

export default function LeadsPage() {
  const { accessToken, refreshAccessToken, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    new: 0,
    qualified: 0,
    converted: 0,
    total_assigned: 0,
    total_sub_assigned: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [loading, setLoading] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const statusColors = useMemo(() => ({
    enquiry: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
    registered: 'bg-teal-100 text-teal-700',
    lost: 'bg-red-100 text-red-700',
  }), []);

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

  const handleDeleteLead = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lead? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await authFetch(
        `${API_BASE_URL}/leads/${id}/`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      setLeads(prev => prev.filter(lead => lead.id !== id));
      setTotalCount(prev => prev - 1);

      alert('Lead deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete lead');
    }
  };

  // Fetch staff members for the filter dropdown
  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchStaffMembers = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/auth/users/`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch staff members');
        }

        const data = await res.json();
        setStaffMembers(data);
      } catch (err) {
        console.error('Failed to load staff members:', err);
      }
    };

    fetchStaffMembers();
  }, [authLoading, accessToken, authFetch]);

  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          page_size: PAGE_SIZE,
          ...(searchTerm && { search: searchTerm }),
          ...(filterStatus !== 'all' && { status: filterStatus.toUpperCase() }),
          ...(filterPriority !== 'all' && { priority: filterPriority.toUpperCase() }),
          ...(filterSource !== 'all' && { source: filterSource.toUpperCase() }),
          ...(filterStaff !== 'all' && { 
            ...(filterStaff === 'unassigned' 
              ? { assigned_to: 'null' } 
              : { assigned_to: filterStaff })
          }),
        });

        const res = await authFetch(`${API_BASE_URL}/leads/?${params}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch leads');
        }

        const data = await res.json();
        
        // Backend returns { count, next, previous, results: { leads: [...], stats: {...} } }
        const leadsData = data.results?.leads || data.results || [];
        const statsData = data.results?.stats || {};

        // Transform leads data to match table expectations
        const transformedLeads = leadsData.map((lead) => ({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email || 'No email provided',
          location: lead.location || 'No location',
          status: lead.status.toLowerCase(),
          source: lead.source,
          interest: lead.program,
          program: lead.program,
          priority: lead.priority,
          
          // Two-level assignment
          assigned_to: lead.assigned_to,
          assigned_by: lead.assigned_by,
          assigned_date: lead.assigned_date,
          sub_assigned_to: lead.sub_assigned_to,
          sub_assigned_by: lead.sub_assigned_by,
          sub_assigned_date: lead.sub_assigned_date,
          current_handler: lead.current_handler,
          
          // Processing
          processing_status: lead.processing_status,
          
          date: new Date(lead.created_at).toLocaleDateString('en-IN'),
          created_at: lead.created_at,
        }));

        setLeads(transformedLeads);
        setStats(statsData);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / PAGE_SIZE));
      } catch (err) {
        console.error('Failed to load leads:', err);
        alert('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [authLoading, accessToken, authFetch, page, searchTerm, filterStatus, filterPriority, filterSource, filterStaff]);

  const statsCards = useMemo(() => [
    { label: 'Total Leads', value: totalCount, color: 'bg-blue-500', icon: Users },
    { label: 'New Leads', value: stats.new || 0, color: 'bg-indigo-500', icon: UserPlus },
    { label: 'Qualified', value: stats.qualified || 0, color: 'bg-purple-500', icon: CheckCircle },
    { label: 'Converted', value: stats.converted || 0, color: 'bg-green-500', icon: TrendingUp },
  ], [totalCount, stats]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-10 text-center">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <LeadsPageHeader />

        {loading && page === 1 ? (
          <div className="text-center py-10 text-gray-500">Loading leads…</div>
        ) : (
          <>
            <LeadsStatsCards stats={statsCards} />

            <LeadsFilters
              searchTerm={searchTerm}
              setSearchTerm={(v) => { setPage(1); setSearchTerm(v); }}
              filterStatus={filterStatus}
              setFilterStatus={(v) => { setPage(1); setFilterStatus(v); }}
              filterPriority={filterPriority}
              setFilterPriority={(v) => { setPage(1); setFilterPriority(v); }}
              filterSource={filterSource}
              setFilterSource={(v) => { setPage(1); setFilterSource(v); }}
              filterStaff={filterStaff}
              setFilterStaff={(v) => { setPage(1); setFilterStaff(v); }}
              staffMembers={staffMembers}
            />

            <LeadsTable
              leads={leads}
              statusColors={statusColors}
              onDeleteLead={handleDeleteLead}
            />
            
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-8"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}