import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Components/layouts/Navbar';
import {
  BarChart3, TrendingUp, Calendar, Download, Phone,
  PhoneIncoming, PhoneMissed, Clock, RefreshCw, Wifi, WifiOff,
  PhoneOutgoing, Search, ChevronLeft, ChevronRight, Filter,
  Activity, AlertCircle, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../Components/utils/callPermissions';

const API_BASE = 'https://lpcrmbackend.vercel.app/api';

// ─── API helpers ──────────────────────────────────────────────────────────────

function buildDateParams(dateRange) {
  const now  = new Date();
  const from = new Date();
  if (dateRange === 'today')  from.setHours(0, 0, 0, 0);
  if (dateRange === '7days')  from.setDate(now.getDate() - 7);
  if (dateRange === '30days') from.setDate(now.getDate() - 30);
  if (dateRange === '90days') from.setDate(now.getDate() - 90);
  return { from: from.toISOString(), to: now.toISOString() };
}

// Hook: fetch stats from /voxbay/stats/
function useCallStats(dateRange, callType) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { from, to } = buildDateParams(dateRange);
      const params = new URLSearchParams({ from, to });
      if (callType && callType !== 'all') params.set('call_type', callType);
      const res = await fetch(`${API_BASE}/voxbay/stats/?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStats(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [dateRange, callType]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { stats, loading, error, refetch: fetch_ };
}

// Hook: fetch paginated call logs from /voxbay/call-logs/
function useCallLogs({ dateRange, callType, callStatus, search, ordering, page, pageSize }) {
  const [data, setData]       = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { from, to } = buildDateParams(dateRange);
      const params = new URLSearchParams({ from, to, page, page_size: pageSize });
      if (callType   && callType   !== 'all') params.set('call_type',   callType);
      if (callStatus && callStatus !== 'all') params.set('call_status', callStatus);
      if (search)    params.set('search',   search);
      if (ordering)  params.set('ordering', ordering);
      const res = await fetch(`${API_BASE}/voxbay/call-logs/?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setData({ results: json.results || [], count: json.count || 0, page: json.page || 1, page_size: json.page_size || pageSize });
      setLastSync(new Date());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [dateRange, callType, callStatus, search, ordering, page, pageSize]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_, lastSync };
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────

function StatCard({ label, value, color, Icon, sub, accent }) {
  return (
    <div className={`group relative bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accent || 'bg-blue-500'} rounded-l-2xl`} />
      <div className="flex items-start justify-between mb-3 pl-2">
        <div>
          <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">{label}</p>
          <h3 className="text-3xl font-black text-gray-900">{value ?? '—'}</h3>
        </div>
        <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-white" size={18} />
        </div>
      </div>
      {sub && <p className="text-[11px] text-gray-400 pl-2 font-medium">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ANSWERED:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    BUSY:      'bg-amber-100  text-amber-700  border-amber-200',
    NOANSWER:  'bg-red-100    text-red-700    border-red-200',
    CANCEL:    'bg-red-100    text-red-600    border-red-200',
    MISSED:    'bg-red-100    text-red-600    border-red-200',
    CONGESTION:'bg-purple-100 text-purple-700 border-purple-200',
    CHANUNAVAIL:'bg-gray-100  text-gray-600   border-gray-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}

function BarRow({ label, value, max, colorClass = 'bg-blue-500', height = 'h-7' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-gray-600">{label}</span>
        <span className="text-gray-400 font-mono">{value}</span>
      </div>
      <div className={`w-full ${height} bg-gray-100 rounded-lg overflow-hidden`}>
        <div className={`h-full ${colorClass} rounded-lg transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Skeleton({ rows = 4, h = 'h-8' }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => <div key={i} className={`${h} bg-gray-100 rounded-lg`} />)}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-300">
      <Phone size={36} className="mb-3" />
      <p className="text-sm font-semibold text-gray-400">{message}</p>
    </div>
  );
}

// ─── Derived chart data from stats ────────────────────────────────────────────

function buildChartData(logs) {
  // hourly and weekly breakdown from raw logs (used as supplemental chart)
  const hourMap = {};
  const dayMap  = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  logs.forEach(l => {
    if (!l.created_at) return;
    const d = new Date(l.created_at);
    const h = d.getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
    const dn = dayNames[d.getDay()];
    dayMap[dn] = (dayMap[dn] || 0) + 1;
  });

  const callsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`,
    calls: hourMap[i] || 0, h: i,
  })).filter(x => x.calls > 0 || (x.h >= 8 && x.h <= 18));

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({ day, calls: dayMap[day] }));

  const agentMap = {};
  logs.forEach(l => {
    const key = l.agent_number || '';
    if (!key) return;
    if (!agentMap[key]) agentMap[key] = { calls:0, answered:0 };
    agentMap[key].calls++;
    if (l.call_status === 'ANSWERED') agentMap[key].answered++;
  });
  const topAgents = Object.entries(agentMap)
    .map(([name, s]) => ({ name, ...s, rate: s.calls ? +((s.answered/s.calls)*100).toFixed(1) : 0 }))
    .sort((a,b) => b.calls - a.calls).slice(0, 5);

  return { callsByHour, weekDays, topAgents };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CallAnalyticsPage() {
  const { user } = useAuth();
  const userRole = user?.role || user?.user_role || '';

  // Shared filters
  const [dateRange,  setDateRange]  = useState('7days');
  const [callType,   setCallType]   = useState('all');

  // Log-table filters
  const [callStatus, setCallStatus] = useState('all');
  const [search,     setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering,   setOrdering]   = useState('-created_at');
  const [page,       setPage]       = useState(1);
  const pageSize = 20;

  // Stats from backend /voxbay/stats/
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useCallStats(dateRange, callType);

  // Logs with pagination
  const { data: logsData, loading: logsLoading, error: logsError, refetch: refetchLogs, lastSync } =
    useCallLogs({ dateRange, callType, callStatus, search, ordering, page, pageSize });

  const logs      = logsData.results;
  const totalLogs = logsData.count;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const loading = statsLoading || logsLoading;
  const error   = statsError || logsError;

  const refetchAll = () => { refetchStats(); refetchLogs(); };

  // Chart data derived from current page's logs
  const { callsByHour, weekDays, topAgents } = buildChartData(logs);
  const maxHour = Math.max(...callsByHour.map(h => h.calls), 1);
  const maxWeek = Math.max(...weekDays.map(d => d.calls), 1);

  // Reset page when filters change
  useEffect(() => setPage(1), [dateRange, callType, callStatus, search, ordering]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const handleExport = () => {
    const headers = ['UUID','Type','Caller','Called','Agent','Extension','Destination','Status','Duration(s)','Conv Duration(s)','Start','End','Recording'];
    const rows = logs.map(l => [
      l.call_uuid, l.call_type, l.caller_number, l.called_number,
      l.agent_number, l.extension, l.destination, l.call_status,
      l.duration, l.conversation_duration, l.call_start, l.call_end, l.recording_url
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `call-logs-${dateRange}.csv`,
    });
    a.click();
  };

  // Stats values (from backend /stats/ endpoint)
  const s = stats || {};
  const fmtSec = (sec) => sec ? `${Math.floor(sec/60)}m ${sec%60}s` : '—';

  return (
    <div className="min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-white" size={20} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Call Analytics</h1>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1" />
            </div>
            <p className="text-gray-400 text-sm ml-[52px]">
              Role: <span className="font-semibold text-indigo-600">{getRoleLabel(userRole)}</span>
              {lastSync && <span className="ml-2 text-gray-300">· Synced {lastSync.toLocaleTimeString()}</span>}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {error ? <WifiOff size={12}/> : <Wifi size={12}/>}
              {error ? 'Offline' : `${totalLogs.toLocaleString()} records`}
            </div>

            <button onClick={refetchAll} disabled={loading}
              className="p-2 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-40" title="Refresh">
              <RefreshCw size={15} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Call type */}
            <select value={callType} onChange={e => setCallType(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-400">
              <option value="all">All Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>

            {/* Date range */}
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-400">
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button onClick={handleExport}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <div>
              <p className="font-bold text-red-700 text-sm">Could not load call data</p>
              <p className="text-xs text-red-400">{error}</p>
            </div>
            <button onClick={refetchAll} className="ml-auto text-xs text-red-600 underline font-semibold">Retry</button>
          </div>
        )}

        {/* ── Stat cards — from /voxbay/stats/ ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Calls"  value={statsLoading ? '…' : s.total}        color="bg-blue-600"   accent="bg-blue-500"   Icon={Phone}         sub={dateRange} />
          <StatCard label="Answered"     value={statsLoading ? '…' : s.answered}     color="bg-emerald-500" accent="bg-emerald-400" Icon={PhoneIncoming}  sub={`${s.success_rate ?? 0}% rate`} />
          <StatCard label="Missed"       value={statsLoading ? '…' : s.missed}       color="bg-red-500"    accent="bg-red-400"    Icon={PhoneMissed}    sub="No answer / cancel" />
          <StatCard label="Busy"         value={statsLoading ? '…' : s.busy}         color="bg-amber-500"  accent="bg-amber-400"  Icon={Zap}            sub="Busy signal" />
          <StatCard label="Incoming"     value={statsLoading ? '…' : s.incoming}     color="bg-indigo-500" accent="bg-indigo-400" Icon={PhoneIncoming}  sub="Inbound calls" />
          <StatCard label="Outgoing"     value={statsLoading ? '…' : s.outgoing}     color="bg-violet-500" accent="bg-violet-400" Icon={PhoneOutgoing}  sub="Outbound calls" />
        </div>

        {/* ── Success rate + Avg duration ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Success Rate</p>
                <p className="text-4xl font-black text-emerald-600">{statsLoading ? '…' : `${s.success_rate ?? 0}%`}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${s.success_rate ?? 0}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{s.answered} of {s.total} calls answered</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Avg Call Duration</p>
                <p className="text-4xl font-black text-blue-600">{statsLoading ? '…' : fmtSec(Math.round(s.avg_duration))}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white" size={24} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: 'Congestion',  val: s.congestion  ?? 0, color: 'text-purple-600' },
                { label: 'Unavailable', val: s.chanunavail ?? 0, color: 'text-gray-500'   },
                { label: 'Busy',        val: s.busy        ?? 0, color: 'text-amber-600'  },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center bg-gray-50 rounded-xl p-2">
                  <p className={`text-lg font-black ${color}`}>{statsLoading ? '…' : val}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

          {/* Hourly */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
            <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={18} /> Calls by Hour
            </h3>
            {logsLoading ? <Skeleton rows={5} /> : callsByHour.every(h => h.calls === 0)
              ? <EmptyState message="No hourly data" />
              : (
                <>
                  <div className="space-y-2">
                    {callsByHour.map(({ hour, calls }) => (
                      <BarRow key={hour} label={hour} value={calls} max={maxHour}
                        colorClass="bg-gradient-to-r from-blue-500 to-indigo-500" height="h-6" />
                    ))}
                  </div>
                  <p className="text-[11px] text-blue-600 font-bold mt-3">
                    📊 Peak: {callsByHour.find(h => h.calls === maxHour)?.hour}
                  </p>
                </>
              )}
          </div>

          {/* Top Agents */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
            <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={18} /> Top Agents
            </h3>
            {logsLoading ? <Skeleton rows={4} h="h-14" /> : topAgents.length === 0
              ? <EmptyState message="No agent data yet" />
              : (
                <div className="space-y-3">
                  {topAgents.map(({ name, calls, answered, rate }, i) => (
                    <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm font-mono truncate">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{calls} calls</span>
                        </div>
                      </div>
                      <p className="text-lg font-black text-emerald-600">{rate}%</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* ── Weekly trend ── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md mb-6">
          <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-500" size={18} /> Weekly Trend
          </h3>
          {logsLoading ? <Skeleton rows={5} h="h-8" /> : (
            <div className="space-y-2">
              {weekDays.map(({ day, calls }) => (
                <BarRow key={day} label={day} value={calls} max={maxWeek} height="h-8"
                  colorClass={`${calls === maxWeek ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} />
              ))}
            </div>
          )}
        </div>

        {/* ── Outcome distribution ── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md mb-6">
          <h3 className="text-base font-black text-gray-900 mb-4">Call Outcome Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Answered',    val: s.answered,   dot: 'bg-emerald-500', text: 'text-emerald-600' },
              { label: 'Missed',      val: s.missed,     dot: 'bg-red-500',     text: 'text-red-600'     },
              { label: 'Busy',        val: s.busy,       dot: 'bg-amber-500',   text: 'text-amber-600'   },
              { label: 'Congestion',  val: s.congestion, dot: 'bg-purple-500',  text: 'text-purple-600'  },
              { label: 'Unavailable', val: s.chanunavail,dot: 'bg-gray-400',    text: 'text-gray-600'    },
            ].map(({ label, val, dot, text }) => (
              <div key={label} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className={`w-2.5 h-2.5 ${dot} rounded-full`} />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className={`text-3xl font-black ${text}`}>{statsLoading ? '…' : val ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {s.total ? (((val ?? 0) / s.total) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Call Logs Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          {/* Table header + filters */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Filter size={16} className="text-gray-400" /> Call Logs
                <span className="text-sm font-semibold text-gray-400">({totalLogs.toLocaleString()} total)</span>
              </h3>
            </div>

            {/* Search + filters row */}
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-1.5 flex-1 min-w-[200px] max-w-sm">
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search number, agent, UUID…"
                  className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 font-medium" />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Search size={14} />
                </button>
              </form>

              {/* Status filter */}
              <select value={callStatus} onChange={e => setCallStatus(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-400">
                <option value="all">All Statuses</option>
                <option value="ANSWERED">Answered</option>
                <option value="NOANSWER">No Answer</option>
                <option value="BUSY">Busy</option>
                <option value="CANCEL">Cancelled</option>
                <option value="CONGESTION">Congestion</option>
                <option value="CHANUNAVAIL">Unavailable</option>
              </select>

              {/* Ordering */}
              <select value={ordering} onChange={e => setOrdering(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-400">
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-duration">Longest Duration</option>
                <option value="duration">Shortest Duration</option>
                <option value="call_status">Status A-Z</option>
              </select>
            </div>
          </div>

          {/* Table body */}
          {logsLoading ? (
            <div className="p-8"><Skeleton rows={6} /></div>
          ) : logs.length === 0 ? (
            <EmptyState message="No call logs for this filter" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <tr>
                    {['Type','Caller','Called / Dest','Agent / Ext','Status','Duration','Conv. Duration','Start','Recording'].map(h => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log, i) => (
                    <tr key={log.call_uuid || i} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {log.call_type === 'incoming'
                          ? <span className="flex items-center gap-1 text-indigo-600 font-bold text-[11px]"><PhoneIncoming size={12}/> IN</span>
                          : <span className="flex items-center gap-1 text-violet-600 font-bold text-[11px]"><PhoneOutgoing size={12}/> OUT</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700 text-xs">{log.caller_number || '—'}</td>
                      <td className="px-4 py-3 font-mono text-gray-700 text-xs">{log.called_number || log.destination || '—'}</td>
                      <td className="px-4 py-3 font-mono text-gray-600 text-xs">{log.agent_number || log.extension || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={log.call_status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                        {log.duration_display || (log.duration ? `${Math.floor(log.duration/60)}m ${log.duration%60}s` : '—')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                        {log.conversation_duration_display || (log.conversation_duration ? `${Math.floor(log.conversation_duration/60)}m ${log.conversation_duration%60}s` : '—')}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {log.call_start ? new Date(log.call_start).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {log.recording_url
                          ? <a href={log.recording_url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 font-bold text-xs flex items-center gap-1">▶ Play</a>
                          : <span className="text-gray-200 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-400 font-medium">
                Page {page} of {totalPages} · {totalLogs.toLocaleString()} records
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all font-semibold">
                  «
                </button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all">
                  <ChevronLeft size={14} />
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 text-xs rounded-lg border font-bold transition-all ${pg === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all">
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all font-semibold">
                  »
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
