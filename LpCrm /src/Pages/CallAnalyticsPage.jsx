import React, { useState } from 'react';
import Navbar from '../Components/layouts/Navbar';
import { BarChart3, TrendingUp, Calendar, Download, Phone, PhoneIncoming, PhoneMissed, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../utils/callPermissions';

export default function CallAnalyticsPage() {
  const { user } = useAuth();
  const userRole = user?.role || user?.user_role || '';

  const [dateRange, setDateRange] = useState('7days');

  // Mock stats
  const callStats = {
    totalCalls: 156, answeredCalls: 124, missedCalls: 32,
    averageDuration: '4m 32s', callsToday: 18, successRate: 79.5,
  };

  const statCards = [
    { label:'Total Calls',   value:callStats.totalCalls,     color:'bg-blue-500',   Icon:Phone,         change:'+12%', up:true  },
    { label:'Answered',      value:callStats.answeredCalls,  color:'bg-green-500',  Icon:PhoneIncoming, change:'+8%',  up:true  },
    { label:'Missed',        value:callStats.missedCalls,    color:'bg-red-500',    Icon:PhoneMissed,   change:'-3%',  up:false },
    { label:'Avg Duration',  value:callStats.averageDuration,color:'bg-purple-500', Icon:Clock,         change:'+15%', up:true  },
  ];

  const callsByHour = [
    { hour:'9 AM', calls:8 }, { hour:'10 AM', calls:12 }, { hour:'11 AM', calls:15 },
    { hour:'12 PM', calls:10 }, { hour:'1 PM', calls:9 }, { hour:'2 PM', calls:18 },
    { hour:'3 PM', calls:16 }, { hour:'4 PM', calls:14 }, { hour:'5 PM', calls:11 },
  ];
  const maxHour = Math.max(...callsByHour.map(h => h.calls));

  const topPerformers = [
    { name:'Sarah Johnson', calls:45, answered:38, rate:84.4 },
    { name:'Mike Chen',     calls:42, answered:35, rate:83.3 },
    { name:'Emma Davis',    calls:38, answered:30, rate:78.9 },
    { name:'James Wilson',  calls:31, answered:21, rate:67.7 },
  ];

  const weekDays = [
    { day:'Monday',    calls:28, trend:'+12%', up:true  },
    { day:'Tuesday',   calls:32, trend:'+18%', up:true  },
    { day:'Wednesday', calls:35, trend:'+5%',  up:true  },
    { day:'Thursday',  calls:30, trend:'-8%',  up:false },
    { day:'Friday',    calls:31, trend:'+3%',  up:true  },
  ];
  const maxWeek = Math.max(...weekDays.map(d => d.calls));

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
            <p className="text-gray-600 text-lg font-medium">
              Viewing as <span className="font-bold text-indigo-600">{getRoleLabel(userRole)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>

            <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              Export
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(({ label, value, color, Icon, change, up }) => (
            <div key={label} className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold tracking-wide uppercase mb-2">{label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </h3>
                </div>
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={20} />
                </div>
              </div>
              <p className={`text-xs font-bold ${up ? 'text-green-600' : 'text-red-600'}`}>
                {change} <span className="text-gray-500 font-normal">vs last week</span>
              </p>
            </div>
          ))}
        </div>

        {/* Success Rate + Today */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 text-sm font-semibold mb-1">Success Rate</p>
                <p className="text-4xl font-bold text-green-700">{callStats.successRate}%</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
            <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${callStats.successRate}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {callStats.answeredCalls} of {callStats.totalCalls} calls answered
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 text-sm font-semibold mb-1">Calls Today</p>
                <p className="text-4xl font-bold text-blue-700">{callStats.callsToday}</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="text-white" size={28} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Active
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Peak Hours</p>
                <p className="font-bold text-gray-900 mt-1">2 PM – 4 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Volume + Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={22} /> Call Volume by Hour
            </h3>
            <div className="space-y-3">
              {callsByHour.map(({ hour, calls }) => (
                <div key={hour}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{hour}</span>
                    <span className="text-gray-600">{calls}</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${(calls / maxHour) * 100}%` }}>
                      {(calls / maxHour) * 100 > 30 && (
                        <span className="text-white text-xs font-bold">{calls}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold">📊 Peak: 2:00 PM – 3:00 PM</p>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={22} /> Top Performers
            </h3>
            <div className="space-y-4">
              {topPerformers.map(({ name, calls, answered, rate }, i) => (
                <div key={name} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-600">{calls} calls · {answered} answered</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">{rate}%</p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="text-purple-600" size={22} /> Weekly Trend
          </h3>
          <div className="space-y-4">
            {weekDays.map(({ day, calls, trend, up }) => (
              <div key={day}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700 w-24">{day}</span>
                  <span className={`font-bold ${up ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
                  <span className="text-gray-600">{calls} calls</span>
                </div>
                <div className="w-full h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div className={`h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500 ${up ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-orange-600'}`}
                    style={{ width: `${(calls / maxWeek) * 100}%` }}>
                    <span className="text-white text-sm font-bold">{calls}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Call Outcome Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Answered',  value:124, dot:'bg-green-500',  pct:79.5 },
              { label:'Missed',    value:32,  dot:'bg-red-500',    pct:20.5 },
              { label:'Voicemail', value:18,  dot:'bg-yellow-500', pct:11.5 },
              { label:'Busy',      value:14,  dot:'bg-orange-500', pct:9.0  },
            ].map(({ label, value, dot, pct }) => (
              <div key={label} className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
                  <span className={`w-3 h-3 ${dot} rounded-full`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{pct}% of total</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}