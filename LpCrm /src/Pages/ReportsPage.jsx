import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import Pagination from '../Components/common/Pagination';
import { Calendar, FileText, Download, FolderOpen, TrendingUp, Clock, CheckCircle, Eye, Check, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('this-month');
  const [recentReports, setRecentReports] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 10;
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

  // Fetch reports with pagination
  const fetchReports = async (pageNumber = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/reports/`, {
        params: { page: pageNumber, page_size: PAGE_SIZE, date_range: dateRange },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setRecentReports(res.data.results || []);
      setTotalCount(res.data.count || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [accessToken]);

  useEffect(() => {
    fetchReports(page);
  }, [accessToken, page, dateRange]);

  // Approve report
  // Approve report
  const handleApproveReport = async (reportId) => {
    if (!accessToken) return;
    setLoading(true);

    try {
      // Optionally, update UI immediately (optimistic update)
      setRecentReports(prev =>
        prev.map(r =>
          r.id === reportId ? { ...r, approved: true } : r
        )
      );

      setStatsData(prevStats => ({
        ...prevStats,
        approved: (prevStats?.approved || 0) + 1,
        pending: (prevStats?.pending || 0) - 1
      }));

      // Make the API call to approve report
      await axios.patch(
        `${API_BASE}/admin/reports/${reportId}/approve/`,
        { approved: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Optional: refetch reports to sync fully with backend
      await fetchReports(page);
      await fetchStats();

      alert('Report approved successfully!');
    } catch (err) {
      console.error('Failed to approve report:', err);
      alert('Failed to approve report');

      // Rollback UI if API fails
      setRecentReports(prev =>
        prev.map(r =>
          r.id === reportId ? { ...r, approved: false } : r
        )
      );
      setStatsData(prevStats => ({
        ...prevStats,
        approved: (prevStats?.approved || 1) - 1,
        pending: (prevStats?.pending || 0) + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  // Stats cards from backend
  const stats = [
    {
      label: 'Total Reports',
      value: statsData?.total || 0,
      color: 'from-blue-500 to-blue-600',
      icon: FolderOpen
    },
    {
      label: 'This Month',
      value: statsData?.this_month || 0,
      color: 'from-purple-500 to-indigo-600',
      icon: TrendingUp

    },
    {
      label: 'Approved',
      value: statsData?.approved || 0,
      color: 'from-emerald-500 to-green-600',
      icon: CheckCircle

    },
    {
      label: 'Pending',
      value: statsData?.pending || 0,
      color: 'from-amber-500 to-orange-600',
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 text-lg">Generate and download comprehensive reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase">{stat.label}</p>
                    </div>
                    <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {stat.value.toLocaleString()}
                    </h3>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Report Period</h3>
                <p className="text-sm text-gray-600">Select date range for report generation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-gray-700 hover:border-indigo-300 transition-colors"
              >
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 hover:underline transition-colors">
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Generated By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <FileText className="text-white w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-200">
                        {report.type || report.heading}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{report.user_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{report.report_date}</td>
                    <td className="px-6 py-4">
                      {report.approved ? (
                        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold border border-yellow-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => navigate(`/reports/view/${report.id}`)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
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
                            className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
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
                            className="p-2.5 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md"
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No reports found</p>
                        <p className="text-gray-400 text-xs mt-1">Reports will appear here once generated</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {recentReports.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </main>
    </div>
  );
}