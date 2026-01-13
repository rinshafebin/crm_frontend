import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import { Calendar, FileText, Download, FolderOpen, TrendingUp, Clock, CheckCircle, Eye, Check } from 'lucide-react';

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('this-month');
  const [recentReports, setRecentReports] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch stats
  const fetchStats = async () => {
    if (!accessToken) return;
    try {
      const res = await axios.get(`${API_BASE}/admin/reports/stats/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStatsData(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    if (!accessToken) return;
    try {
      const res = await axios.get(`${API_BASE}/admin/reports/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecentReports(res.data.results);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [accessToken]);

  // Loading state
  if (!statsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading report stats...</p>
      </div>
    );
  }

  // Approve report
  const handleApproveReport = async (reportId) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/admin/reports/${reportId}/approve/`,
        { approved: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchReports();
      fetchStats(); // refresh stats after approval
      alert('Report approved successfully!');
    } catch (err) {
      console.error('Failed to approve report:', err);
      alert('Failed to approve report');
    } finally {
      setLoading(false);
    }
  };

  // Stats cards from backend
  const stats = [
    {
      label: 'Total Reports',
      value: statsData.total,
      color: 'bg-blue-500',
      icon: FolderOpen
    },
    {
      label: 'This Month',
      value: statsData.this_month,
      color: 'bg-green-500',
      icon: TrendingUp
    },
    {
      label: 'Approved',
      value: statsData.approved,
      color: 'bg-emerald-500',
      icon: CheckCircle
    },
    {
      label: 'Pending',
      value: statsData.pending,
      color: 'bg-yellow-500',
      icon: Clock
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Report Period</h3>
                <p className="text-sm text-gray-600">Select date range for report generation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Generated By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-gray-400" size={18} />
                          <span className="font-medium text-gray-900">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                          {report.type || report.heading}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{report.user_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.report_date}</td>
                      <td className="px-6 py-4">
                        {report.approved ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/reports/view/${report.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Report"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Download Button */}
                          {report.attached_file && (
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                              title="Download Report"
                            >
                              <Download size={18} />
                            </a>
                          )}

                          {/* Approve Button */}
                          {!report.approved && (
                            <button
                              onClick={() => handleApproveReport(report.id)}
                              disabled={loading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                              title="Approve Report"
                            >
                              <Check size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentReports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}