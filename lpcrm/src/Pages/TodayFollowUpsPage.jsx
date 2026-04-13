import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  CalendarClock, Phone, MessageSquare, Mail, Users,
  AlertTriangle, ArrowLeft, RefreshCw, Search, SlidersHorizontal,
  CheckCircle, Clock, Edit, Trash2, X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TYPE_ICON = {
  call: Phone, whatsapp: MessageSquare, email: Mail, meeting: Users,
};
const TYPE_COLOR = {
  call:     'bg-green-100 text-green-700 border-green-200',
  whatsapp: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  email:    'bg-blue-100 text-blue-700 border-blue-200',
  meeting:  'bg-purple-100 text-purple-700 border-purple-200',
};
const STATUS_COLOR = {
  pending:        'bg-yellow-100 text-yellow-700',
  contacted:      'bg-green-100 text-green-700',
  not_interested: 'bg-red-100 text-red-700',
  rescheduled:    'bg-indigo-100 text-indigo-700',
};
const STATUS_LABEL = {
  pending:        'Pending',
  contacted:      'Contacted',
  not_interested: 'Not Interested',
  rescheduled:    'Rescheduled',
};
const PRIORITY_COLOR = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-600',
};

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-100 rounded-full w-20" />
      <div className="h-6 bg-gray-100 rounded-full w-16" />
    </div>
    <div className="h-8 bg-gray-100 rounded-xl" />
  </div>
);

// ── Stat chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${color}`}>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
  </div>
);

// ── Follow-Up Card ────────────────────────────────────────────────────────────
const FollowUpCard = ({ item, onStatusChange, onDelete }) => {
  const TypeIcon    = TYPE_ICON[item.followup_type]  || Phone;
  const typeColor   = TYPE_COLOR[item.followup_type] || 'bg-gray-100 text-gray-600 border-gray-200';
  const statusColor = STATUS_COLOR[item.status]      || 'bg-gray-100 text-gray-600';
  const statusLabel = STATUS_LABEL[item.status]      || item.status;
  const priorityColor = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.medium;

  return (
    <div className={`group bg-white rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
      item.is_overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-indigo-200'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${typeColor}`}>
            <TypeIcon size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">
              {item.name || item.phone_number}
            </p>
            {item.name && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Phone size={11} />
                {item.phone_number}
              </p>
            )}
          </div>
        </div>
        {item.is_overdue && (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 flex-shrink-0">
            <AlertTriangle size={12} />
            Overdue
          </span>
        )}
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
          <Clock size={12} className="text-orange-600" />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {formatDate(item.follow_up_date)}
          {item.follow_up_time && (
            <span className="text-gray-400 font-normal ml-1">at {formatTime(item.follow_up_time)}</span>
          )}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColor}`}>
          {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColor.split(' ').slice(0,2).join(' ')}`}>
          {item.followup_type?.charAt(0).toUpperCase() + item.followup_type?.slice(1)}
        </span>
      </div>

      {/* Notes */}
      {item.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 mb-3 line-clamp-2">
          {item.notes}
        </p>
      )}

      {/* Quick actions for pending */}
      {item.status === 'pending' && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onStatusChange(item.id, 'contacted')}
            className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl border border-green-200 transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle size={13} />
            Mark Contacted
          </button>
          <button
            onClick={() => onStatusChange(item.id, 'rescheduled')}
            className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1"
          >
            <Clock size={13} />
            Reschedule
          </button>
        </div>
      )}

      {/* Delete */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => onDelete(item.id)}
          className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TodayFollowUpsPage() {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken, loading: authLoading } = useAuth();
  const tokenRef = useRef(accessToken);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterType,     setFilterType]     = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const authFetch = useCallback(async (url, options = {}, retry = true) => {
    let token = tokenRef.current;
    if (!token) throw new Error('No access token');
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401 && retry) {
      const tok = await refreshAccessToken();
      if (!tok) throw new Error('Session expired');
      tokenRef.current = tok;
      return authFetch(url, options, false);
    }
    return res;
  }, [refreshAccessToken]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/followups/today/`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (!authLoading && accessToken) load();
  }, [authLoading, accessToken, load]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/followups/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { alert('Update failed'); return; }
      const saved = await res.json();
      setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
    } catch { alert('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this follow-up? This cannot be undone.')) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/followups/${id}/`, { method: 'DELETE' });
      if (!res.ok) { alert('Delete failed'); return; }
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert('Delete failed'); }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterPriority('all');
  };

  // Client-side filter
  const visible = items.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.phone_number || '').includes(q) ||
      (item.notes || '').toLowerCase().includes(q);
    const matchStatus   = filterStatus   === 'all' || item.status       === filterStatus;
    const matchType     = filterType     === 'all' || item.followup_type === filterType;
    const matchPriority = filterPriority === 'all' || item.priority      === filterPriority;
    return matchSearch && matchStatus && matchType && matchPriority;
  });

  const stats = {
    total:   items.length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.is_overdue).length,
    done:    items.filter(i => i.status === 'contacted').length,
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-10 text-center text-gray-500">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarClock className="text-white" size={22} />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Today's Follow-Ups
                </h1>
              </div>
              <p className="text-gray-500 ml-[52px] text-sm">{today}</p>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-400 rounded-xl text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatChip label="Total"   value={stats.total}   color="bg-blue-50 text-blue-700 border-blue-200" />
          <StatChip label="Pending" value={stats.pending} color="bg-yellow-50 text-yellow-700 border-yellow-200" />
          <StatChip label="Overdue" value={stats.overdue} color="bg-red-50 text-red-700 border-red-200" />
          <StatChip label="Done"    value={stats.done}    color="bg-green-50 text-green-700 border-green-200" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg border border-gray-100">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, phone, or notes…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Status */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold text-gray-700 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              </div>

              {/* Type */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold text-gray-700 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              </div>

              {/* Priority */}
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold text-gray-700 bg-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              </div>

              {/* Clear */}
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 font-semibold text-gray-600 hover:text-red-600 transition-all"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-500">
            {loading
              ? 'Loading…'
              : `${visible.length} follow-up${visible.length !== 1 ? 's' : ''} found`}
          </p>
          {!loading && visible.length !== items.length && (
            <p className="text-xs text-gray-400">
              Filtered from {items.length} total
            </p>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="text-gray-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {items.length === 0 ? 'No follow-ups today' : 'No results match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {items.length === 0
                ? 'Your follow-up schedule is clear for today!'
                : 'Try adjusting your search or filters.'}
            </p>
            {items.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(item => (
              <FollowUpCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
