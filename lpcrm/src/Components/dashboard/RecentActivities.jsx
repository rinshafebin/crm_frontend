import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Search, Filter, ChevronDown, X,
  User, FileText, CheckSquare, Users, GraduationCap,
  Calendar, LogIn, LogOut, AlertTriangle, Clock,
  RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Action metadata ────────────────────────────────────────────────
const ACTION_META = {
  LEAD_CREATED:            { label: 'Lead Created',            color: 'bg-blue-100 text-blue-700',     icon: FileText },
  LEAD_UPDATED:            { label: 'Lead Updated',            color: 'bg-blue-100 text-blue-700',     icon: FileText },
  LEAD_STATUS_CHANGED:     { label: 'Lead Status Changed',     color: 'bg-cyan-100 text-cyan-700',     icon: FileText },
  LEAD_ASSIGNED:           { label: 'Lead Assigned',           color: 'bg-cyan-100 text-cyan-700',     icon: FileText },
  LEAD_DELETED:            { label: 'Lead Deleted',            color: 'bg-red-100 text-red-700',       icon: FileText },
  FOLLOWUP_CREATED:        { label: 'Follow-Up Created',       color: 'bg-purple-100 text-purple-700', icon: Calendar },
  FOLLOWUP_STATUS_CHANGED: { label: 'Follow-Up Status',        color: 'bg-purple-100 text-purple-700', icon: Calendar },
  FOLLOWUP_CONVERTED:      { label: 'Follow-Up Converted',     color: 'bg-violet-100 text-violet-700', icon: Calendar },
  TASK_CREATED:            { label: 'Task Created',            color: 'bg-indigo-100 text-indigo-700', icon: CheckSquare },
  TASK_UPDATED:            { label: 'Task Updated',            color: 'bg-indigo-100 text-indigo-700', icon: CheckSquare },
  TASK_COMPLETED:          { label: 'Task Completed',          color: 'bg-green-100 text-green-700',   icon: CheckSquare },
  TASK_OVERDUE:            { label: 'Task Overdue',            color: 'bg-red-100 text-red-700',       icon: AlertTriangle },
  TASK_CANCELLED:          { label: 'Task Cancelled',          color: 'bg-gray-100 text-gray-600',     icon: CheckSquare },
  STAFF_CREATED:           { label: 'Staff Created',           color: 'bg-emerald-100 text-emerald-700', icon: Users },
  STAFF_UPDATED:           { label: 'Staff Updated',           color: 'bg-emerald-100 text-emerald-700', icon: Users },
  STAFF_ACTIVATED:         { label: 'Staff Activated',         color: 'bg-green-100 text-green-700',   icon: Users },
  STAFF_DEACTIVATED:       { label: 'Staff Deactivated',       color: 'bg-orange-100 text-orange-700', icon: Users },
  STAFF_DELETED:           { label: 'Staff Deleted',           color: 'bg-red-100 text-red-700',       icon: Users },
  USER_LOGIN:              { label: 'User Login',              color: 'bg-teal-100 text-teal-700',     icon: LogIn },
  USER_LOGOUT:             { label: 'User Logout',             color: 'bg-slate-100 text-slate-600',   icon: LogOut },
  STUDENT_ENROLLED:        { label: 'Student Enrolled',        color: 'bg-pink-100 text-pink-700',     icon: GraduationCap },
  STUDENT_UPDATED:         { label: 'Student Updated',         color: 'bg-pink-100 text-pink-700',     icon: GraduationCap },
  STUDENT_COMPLETED:       { label: 'Student Completed',       color: 'bg-green-100 text-green-700',   icon: GraduationCap },
  STUDENT_DROPPED:         { label: 'Student Dropped',         color: 'bg-red-100 text-red-700',       icon: GraduationCap },
  PENALTY_ISSUED:          { label: 'Penalty Issued',          color: 'bg-red-100 text-red-700',       icon: AlertTriangle },
  ATTENDANCE_MARKED:       { label: 'Attendance Marked',       color: 'bg-amber-100 text-amber-700',   icon: Clock },
  MICROWORK_CREATED:       { label: 'Micro Work Created',      color: 'bg-lime-100 text-lime-700',     icon: Activity },
  MICROWORK_COMPLETED:     { label: 'Micro Work Completed',    color: 'bg-green-100 text-green-700',   icon: Activity },
};

const getActionMeta = (action) =>
  ACTION_META[action] || { label: action, color: 'bg-gray-100 text-gray-600', icon: Activity };

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '—';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatFullDate = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// ── Entity type options for filter ────────────────────────────────
const ENTITY_TYPES = ['Lead', 'Task', 'Staff', 'Student', 'FollowUp', 'MicroWork', 'Trainer', 'Attendance'];

export default function RecentActivities() {
  const { accessToken, refreshAccessToken } = useAuth();

  const [activities, setActivities]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const PAGE_SIZE = 20;

  // Own fetch helper — doesn't depend on parent re-renders
  const fetchWithAuth = useCallback(async (url) => {
    let token = accessToken;
    const makeRequest = (t) =>
      fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`,
        },
      });

    let res = await makeRequest(token);
    if (res.status === 401) {
      token = await refreshAccessToken();
      if (!token) throw new Error('Unable to refresh token');
      res = await makeRequest(token);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }, [accessToken, refreshAccessToken]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (search)       params.set('search', search);
    if (filterAction) params.set('action', filterAction);
    if (filterEntity) params.set('entity_type', filterEntity);
    if (dateFrom)     params.set('date_from', dateFrom);
    if (dateTo)       params.set('date_to', dateTo);
    params.set('ordering', '-created_at');
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String((page - 1) * PAGE_SIZE));
    return `${API_BASE_URL}/activities/?${params.toString()}`;
  }, [search, filterAction, filterEntity, dateFrom, dateTo, page]);

  const fetchActivities = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const url = buildUrl();
      console.debug('[Activities] fetching:', url);
      const data = await fetchWithAuth(url);
      console.debug('[Activities] response:', data);

      if (Array.isArray(data)) {
        setActivities(data);
        setTotalCount(data.length);
      } else {
        setActivities(data.results ?? []);
        setTotalCount(data.count ?? 0);
      }
    } catch (err) {
      console.error('[Activities] error:', err);
      setError(`Failed to load activities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [accessToken, buildUrl, fetchWithAuth]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, filterAction, filterEntity, dateFrom, dateTo]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = search || filterAction || filterEntity || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setFilterAction('');
    setFilterEntity('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              showFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
          <button
            onClick={fetchActivities}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by entity name or description…"
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Expandable filters ── */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* Action filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Action Type</label>
            <div className="relative">
              <select
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Entity type filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Entity Type</label>
            <div className="relative">
              <select
                value={filterEntity}
                onChange={e => setFilterEntity(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Entities</option>
                {ENTITY_TYPES.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold">No activities found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => {
            const meta = getActionMeta(activity.action);
            const IconComp = meta.icon;

            return (
              <div
                key={activity.id || index}
                className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${meta.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${meta.color}`}>
                      {meta.label}
                    </span>
                    {activity.entity_name && (
                      <span className="text-xs text-gray-500 font-medium truncate">
                        · {activity.entity_name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{activity.description}</p>
                  {activity.user && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {activity.user_name || activity.user?.username || `User #${activity.user}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">
                    {formatTimeAgo(activity.created_at)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                    {formatFullDate(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
