import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LeadsPageHeader from '../components/leads/LeadsPageHeader';
import LeadsStatsCards from '../components/leads/LeadsStatsCards';
import LeadsFilters from '../components/leads/LeadsFilters';
import LeadsTable from '../components/leads/LeadsTable';
import { Users, UserPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LeadsPage() {
  const {
    accessToken,
    refreshAccessToken,
    loading: authLoading,
  } = useAuth();

  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const statusColors = useMemo(() => ({
    enquiry: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700'
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

      // Access token expired
      if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error('Session expired');

        return authFetch(url, options, false);
      }

      return res;
    },
    [accessToken, refreshAccessToken]
  );

  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/`);
        const data = await res.json();

        const mappedLeads = data.results.map((lead) => ({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: '-',
          location: '-',
          status: lead.status.toLowerCase(),
          source: lead.source,
          interest: lead.program,
          date: new Date(lead.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        }));

        setLeads(mappedLeads);
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [authLoading, accessToken, authFetch]);


  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);

      const matchesStatus =
        filterStatus === 'all' || lead.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  const stats = useMemo(() => [
    { label: 'Total Leads', value: leads.length, color: 'bg-blue-500', icon: Users },
    {
      label: 'New Leads',
      value: leads.filter(l => l.status === 'enquiry').length,
      color: 'bg-indigo-500',
      icon: UserPlus
    },
    {
      label: 'Qualified',
      value: leads.filter(l => l.status === 'qualified').length,
      color: 'bg-purple-500',
      icon: CheckCircle
    },
    {
      label: 'Converted',
      value: leads.filter(l => l.status === 'converted').length,
      color: 'bg-green-500',
      icon: TrendingUp
    }
  ], [leads]);

  if (authLoading) {
    return <div className="p-10 text-center">Checking session…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <LeadsPageHeader />

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading leads…
          </div>
        ) : (
          <>
            <LeadsStatsCards stats={stats} />

            <LeadsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />

            <LeadsTable
              leads={filteredLeads}
              statusColors={statusColors}
            />
          </>
        )}
      </div>
    </div>
  );
}