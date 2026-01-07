import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '../Components/Navbar';
import LeadsPageHeader from '../Components/leads/LeadsPageHeader';
import LeadsStatsCards from '../Components/leads/LeadsStatsCards';
import LeadsFilters from '../Components/leads/LeadsFilters';
import LeadsTable from '../Components/leads/LeadsTable';
import { Users, UserPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

export default function LeadsPage() {
  const { accessToken, refreshAccessToken, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    new: 0,
    qualified: 0,
    converted: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const statusColors = useMemo(() => ({
    enquiry: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
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
      "Are you sure you want to delete this lead?"
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

      // ✅ Update UI immediately
      setLeads(prev => prev.filter(lead => lead.id !== id));
      setTotalCount(prev => prev - 1);

      alert('Lead deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete lead');
    }
  };


  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          ...(searchTerm && { search: searchTerm }),
          ...(filterStatus !== 'all' && { status: filterStatus.toUpperCase() }),
        });

        const res = await authFetch(`${API_BASE_URL}/leads/?${params}`);
        const data = await res.json();

        setLeads(
          data.results.leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            location: lead.location,
            status: lead.status.toLowerCase(),
            source: lead.source,
            interest: lead.program,
            date: new Date(lead.created_at).toLocaleDateString('en-IN'),
          }))
        );

        setStats(data.results.stats);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [authLoading, accessToken, authFetch, page, searchTerm, filterStatus]);

  const statsCards = useMemo(() => [
    { label: 'Total Leads', value: totalCount, color: 'bg-blue-500', icon: Users },
    { label: 'New Leads', value: stats.new, color: 'bg-indigo-500', icon: UserPlus },
    { label: 'Qualified', value: stats.qualified, color: 'bg-purple-500', icon: CheckCircle },
    { label: 'Converted', value: stats.converted, color: 'bg-green-500', icon: TrendingUp },
  ], [totalCount, stats]);

  if (authLoading) {
    return <div className="p-10 text-center">Checking session…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <LeadsPageHeader />

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading leads…</div>
        ) : (
          <>
            <LeadsStatsCards stats={statsCards} />

            <LeadsFilters
              searchTerm={searchTerm}
              setSearchTerm={(v) => { setPage(1); setSearchTerm(v); }}
              filterStatus={filterStatus}
              setFilterStatus={(v) => { setPage(1); setFilterStatus(v); }}
            />

            <LeadsTable
              leads={leads}
              statusColors={statusColors}
              onDeleteLead={handleDeleteLead}
            />

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
