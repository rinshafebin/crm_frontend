import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Navbar from '../Components/layouts/Navbar';
import LeadsPageHeader from '../Components/leads/LeadsPageHeader';
import LeadsStatsCards from '../Components/leads/LeadsStatsCards';
import LeadsFilters from '../Components/leads/LeadsFilters';
import LeadsTable from '../Components/leads/LeadsTable';
import IncomingCallModal from '../Components/leads/IncomingCallModal.jsx';
import { Users, UserPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Pagination from '../Components/common/Pagination';
import { canReceiveIncoming } from '../Components/utils/callPermissions.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 50;

const EXCLUDED_STAFF_ROLES = ['TRAINER', 'ACCOUNTS'];

export default function LeadsPage() {
  const { accessToken, refreshAccessToken, loading: authLoading, user } = useAuth();

  const userRole = user?.role || user?.user_role || '';

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ new: 0, qualified: 0, converted: 0 });
  const [searchTerm, setSearchTerm]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');   
  const [filterStatus, setFilterStatus]       = useState('all');
  const [filterPriority, setFilterPriority]   = useState('all');
  const [filterSource, setFilterSource]       = useState('all');
  const [filterStaff, setFilterStaff]         = useState('all');
  const [loading, setLoading]                 = useState(false);
  const [staffMembers, setStaffMembers]       = useState([]);
  const [page, setPage]                       = useState(1);
  const [totalPages, setTotalPages]           = useState(1);
  const [totalCount, setTotalCount]           = useState(0);

  const [incomingCall, setIncomingCall] = useState({ isOpen: false, callData: null });

  // Debounce search — wait 400 ms after the user stops typing
  const debounceTimer = useRef(null);
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(value);
    }, 400);
  }, []);

  const statusColors = useMemo(() => ({
    enquiry:    'bg-blue-100   text-blue-700',
    contacted:  'bg-yellow-100 text-yellow-700',
    qualified:  'bg-purple-100 text-purple-700',
    converted:  'bg-green-100  text-green-700',
    registered: 'bg-teal-100   text-teal-700',
    lost:       'bg-red-100    text-red-700',
  }), []);

  const authFetch = useCallback(async (url, options = {}, retry = true) => {
    if (!accessToken) throw new Error('No access token');
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 401 && retry) {
      const tok = await refreshAccessToken();
      if (!tok) throw new Error('Session expired');
      return authFetch(url, options, false);
    }
    return res;
  }, [accessToken, refreshAccessToken]);

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/leads/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setLeads(prev => prev.filter(l => l.id !== id));
      setTotalCount(prev => prev - 1);
      alert('Lead deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete lead');
    }
  };

  const simulateIncomingCall = useCallback(() => {
    if (!canReceiveIncoming(userRole) || leads.length === 0) return;
    const lead = leads[Math.floor(Math.random() * leads.length)];
    setIncomingCall({
      isOpen: true,
      callData: { leadName: lead.name, phoneNumber: lead.phone, program: lead.program, leadId: lead.id },
    });
  }, [leads, userRole]);

  useEffect(() => {
    if (authLoading || !accessToken) return;
    authFetch(`${API_BASE_URL}/employees/`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const filtered = data.filter(
          u => !EXCLUDED_STAFF_ROLES.includes((u.role || '').toUpperCase())
        );
        setStaffMembers(filtered);
      })
      .catch(() => console.error('Failed to load staff'));
  }, [authLoading, accessToken, authFetch]);

  // Fetch leads — uses debouncedSearch instead of searchTerm
  useEffect(() => {
    if (authLoading || !accessToken) return;
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page, page_size: PAGE_SIZE,
          ...(debouncedSearch                && { search: debouncedSearch }),
          ...(filterStatus   !== 'all'       && { status:      filterStatus.toUpperCase()   }),
          ...(filterPriority !== 'all'       && { priority:    filterPriority.toUpperCase() }),
          ...(filterSource   !== 'all'       && { source:      filterSource.toUpperCase()   }),
          ...(filterStaff    !== 'all'       && (filterStaff === 'unassigned'
                                                  ? { assigned_to: 'null' }
                                                  : { assigned_to: filterStaff })),
        });
        const res  = await authFetch(`${API_BASE_URL}/leads/?${params}`);
        if (!res.ok) throw new Error('Failed to fetch leads');
        const data = await res.json();

        const leadsData = data.results?.leads || data.results || [];
        const statsData = data.results?.stats || {};

        setLeads(leadsData.map(l => ({
          id: l.id, name: l.name, phone: l.phone,
          email:    l.email    || 'No email provided',
          location: l.location || 'No location',
          status:   l.status.toLowerCase(),
          source:   l.source,
          interest: l.program, program: l.program,
          priority: l.priority,
          assigned_to:     l.assigned_to,     assigned_by:     l.assigned_by,
          sub_assigned_to: l.sub_assigned_to, sub_assigned_by: l.sub_assigned_by,
          current_handler: l.current_handler,
          date: new Date(l.created_at).toLocaleDateString('en-IN'),
          created_at: l.created_at,
        })));
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
  }, [authLoading, accessToken, authFetch, page, debouncedSearch, filterStatus, filterPriority, filterSource, filterStaff]);

  const statsCards = useMemo(() => [
    { label: 'Total Leads', value: totalCount,          color: 'bg-blue-500',   icon: Users       },
    { label: 'New Leads',   value: stats.new || 0,      color: 'bg-indigo-500', icon: UserPlus    },
    { label: 'Qualified',   value: stats.qualified || 0, color: 'bg-purple-500', icon: CheckCircle },
    { label: 'Converted',   value: stats.converted || 0, color: 'bg-green-500',  icon: TrendingUp  },
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

        {/* ── Demo trigger – remove in production ── */}
        {canReceiveIncoming(userRole) && (
          <div className="mb-4">
            <button onClick={simulateIncomingCall}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors">
              🔔 Simulate Incoming Call (Demo)
            </button>
          </div>
        )}

        {loading && page === 1 ? (
          <div className="text-center py-10 text-gray-500">Loading leads…</div>
        ) : (
          <>
            <LeadsStatsCards stats={statsCards} />

            <LeadsFilters
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}           // ← debounced handler
              filterStatus={filterStatus}
              setFilterStatus={v  => { setPage(1); setFilterStatus(v); }}
              filterPriority={filterPriority}
              setFilterPriority={v => { setPage(1); setFilterPriority(v); }}
              filterSource={filterSource}
              setFilterSource={v  => { setPage(1); setFilterSource(v); }}
              filterStaff={filterStaff}
              setFilterStaff={v   => { setPage(1); setFilterStaff(v); }}
              staffMembers={staffMembers}
            />

            <LeadsTable
              leads={leads}
              statusColors={statusColors}
              onDeleteLead={handleDeleteLead}
              userRole={userRole}
            />

            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-8" />
            )}
          </>
        )}
      </div>

      {/* Incoming call modal – gated by role inside the component */}
      {canReceiveIncoming(userRole) && (
        <IncomingCallModal
          isOpen={incomingCall.isOpen}
          callData={incomingCall.callData}
          onClose={action => { console.log('Call', action); setIncomingCall({ isOpen: false, callData: null }); }}
        />
      )}
    </div>
  );
}