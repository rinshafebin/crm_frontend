import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import Pagination from '../Components/common/Pagination';
import { Calendar, FileText, Download, FolderOpen, TrendingUp, Clock, CheckCircle, Eye, AlertCircle, XCircle } from 'lucide-react';

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

  const PAGE_SIZE = 50;
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

  const fetchReports = async (pageNumber = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/reports/`, {
        params: { page: pageNumber, page_size: PAGE_SIZE },
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
  }, [accessToken, page]);

  // Get status badge based on report.status field
  const getStatusBadge = (report) => {
    const status = report.status?.toLowerCase();
    
    if (status === 'approved') {
      return (
        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 inline-flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold border border-yellow-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Pending
        </span>
      );
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
          <p className="text-gray-600 text-lg">Review and manage all submitted reports</p>
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

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Reports</h2>
            <button 
              onClick={() => {
                fetchReports(page);
                fetchStats();
              }}
              className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 hover:underline transition-colors"
            >
              Refresh →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Heading</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading reports...</p>
                      </div>
                    </td>
                  </tr>
                ) : recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No reports found</p>
                        <p className="text-gray-400 text-xs mt-1">Reports will appear here once submitted</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
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
                        <span className="text-gray-700 font-medium">
                          {report.heading}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{report.user_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{report.report_date}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(report)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View Report Details Button */}
                          <button
                            onClick={() => navigate(`/reports/view/${report.id}`)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                            title="View Report Details"
                          >
                            {/* <Eye size={18} /> */}
                            View
                          </button>

                          {/* View Attachment Button */}
                          {report.attached_file && (
                            <button
                              onClick={() => {
                                const fileUrl = report.file_url;
                                const fileName = report.name || 'file';
                                
                                // Check file extension
                                const lowerUrl = fileUrl?.toLowerCase() || '';
                                const isPdf = lowerUrl.includes('.pdf');
                                const isDoc = lowerUrl.match(/\.(doc|docx)$/);
                                const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/);
                                
                                if (isPdf || isDoc) {
                                  // Use Google Docs Viewer for PDFs and Word docs
                                  const encodedUrl = encodeURIComponent(fileUrl);
                                  const viewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
                                  window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                } else if (isImage) {
                                  // Images open directly
                                  window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  // For other file types, try to open directly
                                  // If Cloudinary URL, add inline flag
                                  let viewUrl = fileUrl;
                                  if (viewUrl.includes('cloudinary.com') && viewUrl.includes('/upload/')) {
                                    viewUrl = viewUrl.replace('/upload/', '/upload/fl_attachment/');
                                  }
                                  window.open(viewUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="p-2.5 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                              title="View Attachment"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {recentReports.length > 0 && totalPages > 1 && (
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