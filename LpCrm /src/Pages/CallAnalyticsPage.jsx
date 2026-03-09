import React, { useState, useEffect } from 'react';
import Navbar from '../Components/layouts/Navbar';
import {
  BarChart3, TrendingUp, Calendar, Download, Phone,
  PhoneIncoming, PhoneMissed, Clock, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../Components/utils/callPermissions';

const API_BASE = 'https://lpcrmbackend.vercel.app/api';

function useCallLogs(dateRange) {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const now  = new Date();
      const from = new Date();
      if (dateRange === 'today')  from.setHours(0, 0, 0, 0);
      if (dateRange === '7days')  from.setDate(now.getDate() - 7);
      if (dateRange === '30days') from.setDate(now.getDate() - 30);
      if (dateRange === '90days') from.setDate(now.getDate() - 90);

      const params = new URLSearchParams({ from: from.toISOString(), to: now.toISOString() });
      const res = await fetch(`${API_BASE}/voxbay/call-logs/?${params}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.results || []);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [dateRange]);
  return { logs, loading, error, refetch: fetchLogs, lastSync };
}

function deriveStats(logs) {
  const total     = logs.length;
  const answered  = logs.filter(l => l.call_status === 'ANSWERED').length;
  const missed    = logs.filter(l => ['NOANSWER','CANCEL','MISSED'].includes(l.call_status)).length;
  const busy      = logs.filter(l => l.call_status === 'BUSY').length;
  const voicemail = logs.filter(l => l.call_status === 'VOICEMAIL').length;

  const durLogs    = logs.filter(l => l.duration && l.duration > 0);
  const avgSec     = durLogs.length ? Math.round(durLogs.reduce((s,l) => s + l.duration, 0) / durLogs.length) : 0;
  const avgDuration = avgSec ? `${Math.floor(avgSec/60)}m ${avgSec%60}s` : '—';

  const today      = new Date().toDateString();
  const callsToday = logs.filter(l => l.created_at && new Date(l.created_at).toDateString() === today).length;
  const successRate = total ? ((answered / total) * 100).toFixed(1) : '0.0';

  const hourMap = {};
  logs.forEach(l => {
    if (!l.created_at) return;
    const h = new Date(l.created_at).getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
  });
  const callsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`,
    calls: hourMap[i] || 0, h: i,
  })).filter(x => x.calls > 0 || (x.h >= 9 && x.h <= 17));

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayMap   = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
  logs.forEach(l => {
    if (!l.created_at) return;
    const d = dayNames[new Date(l.created_at).getDay()];
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({ day, calls: dayMap[day] }));

  const agentMap = {};
  logs.forEach(l => {
    const key = l.agent_number || '';
    if (!key) return;
    if (!agentMap[key]) agentMap[key] = { calls:0, answered:0 };
    agentMap[key].calls++;
    if (l.call_status === 'ANSWERED') agentMap[key].answered++;
  });
  const topPerformers = Object.entries(agentMap)
    .map(([name, s]) => ({ name, ...s, rate: s.calls ? ((s.answered/s.calls)*100).toFixed(1) : '0.0' }))
    .sort((a,b) => b.calls - a.calls).slice(0, 5);

  return { total, answered, missed, busy, voicemail, avgDuration, callsToday, successRate, callsByHour, weekDays, topPerformers };
}

function StatCard({ label, value, color, Icon, sub }) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value ?? '—'}</h3>
        </div>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, color = 'from-blue-500 to-indigo-600', height = 'h-8' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="text-gray-500">{value}</span>
      </div>
      <div className={`w-full ${height} bg-gray-100 rounded-lg overflow-hidden`}>
        <div className={`h-full bg-gradient-to-r ${color} rounded-lg flex items-center justify-end pr-3 transition-all duration-700`}
          style={{ width: `${pct}%` }}>
          {pct > 25 && <span className="text-white text-xs font-bold">{value}</span>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Phone size={40} className="mb-3 opacity-30" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function Skeleton({ rows = 4, height = 'h-8' }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_,i) => <div key={i} className={`${height} bg-gray-100 rounded-lg`} />)}
    </div>
  );
}

export default function CallAnalyticsPage() {
  const { user }  = useAuth();
  const userRole  = user?.role || user?.user_role || '';
  const [dateRange, setDateRange] = useState('7days');

  const { logs, loading, error, refetch, lastSync } = useCallLogs(dateRange);
  const stats   = deriveStats(logs);
  const maxHour = Math.max(...stats.callsByHour.map(h => h.calls), 1);
  const maxWeek = Math.max(...stats.weekDays.map(d => d.calls), 1);

  const handleExport = () => {
    const headers = ['UUID','Caller','Agent','Status','Duration (s)','Start','End'];
    const rows    = logs.map(l => [l.call_uuid,l.caller_number,l.agent_number,l.call_status,l.duration,l.call_start,l.call_end]);
    const csv     = [headers, ...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type:'text/csv' })),
      download: `call-logs-${dateRange}.csv`,
    });
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Call Analytics
              </h1>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Viewing as <span className="font-bold text-indigo-600">{getRoleLabel(userRole)}</span>
              {lastSync && <span className="ml-3 text-gray-400">· Synced {lastSync.toLocaleTimeString()}</span>}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
              {error ? <WifiOff size={13}/> : <Wifi size={13}/>}
              {error ? 'Offline' : `${logs.length} records`}
            </div>

            <button onClick={refetch} disabled={loading}
              className="p-2.5 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-40"
              title="Refresh">
              <RefreshCw size={16} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-gray-700 bg-white">
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button onClick={handleExport}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3">
            <WifiOff className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-700">Could not load call data</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
            <button onClick={refetch} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Calls"  value={loading ? '…' : stats.total}        color="bg-blue-500"   Icon={Phone}         sub={dateRange} />
          <StatCard label="Answered"     value={loading ? '…' : stats.answered}     color="bg-green-500"  Icon={PhoneIncoming} sub={`${stats.total ? ((stats.answered/stats.total)*100).toFixed(0) : 0}% success rate`} />
          <StatCard label="Missed"       value={loading ? '…' : stats.missed}       color="bg-red-500"    Icon={PhoneMissed}   sub="No answer / cancelled" />
          <StatCard label="Avg Duration" value={loading ? '…' : stats.avgDuration}  color="bg-purple-500" Icon={Clock}         sub="Per answered call" />
        </div>

        {/* Success Rate + Today */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 text-sm font-semibold mb-1">Success Rate</p>
                <p className="text-4xl font-bold text-green-700">{stats.successRate}%</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
            <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${stats.successRate}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-3">{stats.answered} of {stats.total} calls answered</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 text-sm font-semibold mb-1">Calls Today</p>
                <p className="text-4xl font-bold text-blue-700">{stats.callsToday}</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="text-white" size={28} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">Webhook</p>
                <p className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                  {error ? 'Disconnected' : 'Live'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Active Agents</p>
                <p className="font-bold text-gray-900 mt-1">{stats.topPerformers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly + Top Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={22} /> Call Volume by Hour
            </h3>
            {loading ? <Skeleton rows={5} /> : stats.callsByHour.every(h => h.calls === 0) ? (
              <EmptyState message="No call data in this period" />
            ) : (
              <>
                <div className="space-y-3">
                  {stats.callsByHour.map(({ hour, calls }) => (
                    <BarRow key={hour} label={hour} value={calls} max={maxHour} />
                  ))}
                </div>
                <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-semibold">
                    📊 Peak: {stats.callsByHour.find(h => h.calls === maxHour)?.hour}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={22} /> Top Agents
            </h3>
            {loading ? <Skeleton rows={4} height="h-16" /> : stats.topPerformers.length === 0 ? (
              <EmptyState message="No agent data yet" />
            ) : (
              <div className="space-y-4">
                {stats.topPerformers.map(({ name, calls, answered, rate }, i) => (
                  <div key={name} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 font-mono text-sm">{name}</p>
                          <p className="text-xs text-gray-500">{calls} calls · {answered} answered</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600">{rate}%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width:`${rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="text-purple-600" size={22} /> Weekly Trend
          </h3>
          {loading ? <Skeleton rows={5} height="h-10" /> : (
            <div className="space-y-4">
              {stats.weekDays.map(({ day, calls }) => (
                <BarRow key={day} label={day} value={calls} max={maxWeek} height="h-10"
                  color={calls === maxWeek ? 'from-purple-500 to-indigo-600' : 'from-blue-400 to-blue-500'} />
              ))}
            </div>
          )}
        </div>

        {/* Outcome Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Call Outcome Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Answered',  value:stats.answered,  dot:'bg-green-500'  },
              { label:'Missed',    value:stats.missed,    dot:'bg-red-500'    },
              { label:'Busy',      value:stats.busy,      dot:'bg-orange-500' },
              { label:'Voicemail', value:stats.voicemail, dot:'bg-yellow-500' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <span className={`w-3 h-3 ${dot} rounded-full`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{loading ? '…' : value}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {stats.total ? ((value/stats.total)*100).toFixed(1) : '0.0'}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Logs Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Call Logs</h3>
            <span className="text-sm text-gray-400">{logs.length} records</span>
          </div>

          {loading ? (
            <div className="p-8"><Skeleton rows={5} /></div>
          ) : logs.length === 0 ? (
            <EmptyState message="No call logs found for this period" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    {['Caller','Agent','Status','Duration','Start','Recording'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.slice(0, 50).map((log, i) => (
                    <tr key={log.call_uuid || i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-gray-700">{log.caller_number || '—'}</td>
                      <td className="px-6 py-3 font-mono text-gray-700">{log.agent_number  || '—'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          log.call_status === 'ANSWERED' ? 'bg-green-100 text-green-700' :
                          log.call_status === 'BUSY'     ? 'bg-orange-100 text-orange-700' :
                          log.call_status === 'NOANSWER' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{log.call_status || 'UNKNOWN'}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {log.duration ? `${Math.floor(log.duration/60)}m ${log.duration%60}s` : '—'}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {log.call_start ? new Date(log.call_start).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-3">
                        {log.recording_url
                          ? <a href={log.recording_url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium">▶ Play</a>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length > 50 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  Showing 50 of {logs.length} records — Export CSV for full data.
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
