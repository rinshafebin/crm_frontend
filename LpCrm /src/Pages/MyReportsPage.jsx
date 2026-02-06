import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/layouts/Navbar';
import { 
  FileText, 
  Plus, 
  Send, 
  X, 
  Calendar, 
  User, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Search,
  Loader2,
  Edit,
  Trash2,
  FileSpreadsheet,
  File,
  Image
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MyReportsPage() {
  const { accessToken, refreshAccessToken, user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    heading: '',
    report_text: '',
    report_date: new Date().toISOString().split('T')[0],
    attached_file: null
  });
  
  const [errors, setErrors] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const userRole = user?.role || 'STAFF';
  const userName = user?.name || user?.username || 'User';

  // Helper function to get file icon based on file type
  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FileText className="w-8 h-8 text-blue-600" />;
    
    const fileName = fileUrl.toLowerCase();
    
    if (fileName.includes('.xlsx') || fileName.includes('.xls')) {
      return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    }
    if (fileName.includes('.pdf')) {
      return <File className="w-8 h-8 text-red-600" />;
    }
    if (fileName.includes('.doc') || fileName.includes('.docx')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png')) {
      return <Image className="w-8 h-8 text-purple-600" />;
    }
    
    return <FileText className="w-8 h-8 text-gray-600" />;
  };

  // Fetch reports with auth
  const fetchWithAuth = async (url, options = {}) => {
    try {
      let token = accessToken;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Unable to refresh token');
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/reports/my/`);
      setReports(data.results || data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchReports();
    }
  }, [accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, attached_file: 'File size must be less than 10MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, attached_file: file }));
      setErrors(prev => ({ ...prev, attached_file: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    }
    if (!formData.report_text.trim()) {
      newErrors.report_text = 'Report text is required';
    }
    if (!formData.report_date) {
      newErrors.report_date = 'Report date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('heading', formData.heading);
      submitData.append('report_text', formData.report_text);
      submitData.append('report_date', formData.report_date);
      
      if (formData.attached_file) {
        submitData.append('attached_file', formData.attached_file);
      }

      const response = await fetch(`${API_BASE_URL}/reports/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create report');
      }

      // Success
      setShowCreateModal(false);
      setFormData({
        name: user?.name || user?.username || '',
        heading: '',
        report_text: '',
        report_date: new Date().toISOString().split('T')[0],
        attached_file: null
      });
      setErrors({});
      fetchReports();
    } catch (err) {
      console.error('Error creating report:', err);
      setErrors({ submit: err.message || 'Failed to create report' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (report) => {
    if (report.status !== 'pending') {
      alert('Only pending reports can be edited');
      return;
    }
    
    setEditingReport(report);
    setFormData({
      name: report.name,
      heading: report.heading,
      report_text: report.report_text,
      report_date: report.report_date,
      attached_file: null
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('heading', formData.heading);
      submitData.append('report_text', formData.report_text);
      submitData.append('report_date', formData.report_date);
      
      // Only append file if a new file was selected
      if (formData.attached_file) {
        submitData.append('attached_file', formData.attached_file);
      }

      const response = await fetch(`${API_BASE_URL}/reports/${editingReport.id}/edit/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update report');
      }

      // Success
      setShowEditModal(false);
      setEditingReport(null);
      setFormData({
        name: user?.name || user?.username || '',
        heading: '',
        report_text: '',
        report_date: new Date().toISOString().split('T')[0],
        attached_file: null
      });
      setErrors({});
      fetchReports();
    } catch (err) {
      console.error('Error updating report:', err);
      setErrors({ submit: err.message || 'Failed to update report' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status?.toLowerCase() === filter;
    const matchesSearch = 
      report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.heading?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Reports
              </h1>
              <p className="text-gray-600 text-lg">
                Submit and track your daily work reports
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports by name or heading..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    filter === status
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading reports...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your filters or search term'
                : 'Get started by creating your first daily report'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {report.heading}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {report.report_text}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{report.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(report.report_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Submitted {formatDate(report.created_at)}</span>
                      </div>
                      {report.attached_file && (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                          <Download className="w-4 h-4" />
                          <span>Attachment</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Edit button - only show for pending reports */}
                    {report.status === 'pending' && (
                      <button 
                        onClick={() => handleEdit(report)}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit report"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* View button */}
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Create New Report</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Heading */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="heading"
                      value={formData.heading}
                      onChange={handleInputChange}
                      placeholder="Brief heading for your report"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.heading ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.heading && (
                      <p className="mt-1 text-sm text-red-500">{errors.heading}</p>
                    )}
                  </div>

                  {/* Report Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="report_date"
                      value={formData.report_date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.report_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.report_date && (
                      <p className="mt-1 text-sm text-red-500">{errors.report_date}</p>
                    )}
                  </div>

                  {/* Report Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="report_text"
                      value={formData.report_text}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Describe your daily activities, accomplishments, and any issues encountered..."
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.report_text ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.report_text && (
                      <p className="mt-1 text-sm text-red-500">{errors.report_text}</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attach File (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Max file size: 10MB. Accepted formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
                    </p>
                    {errors.attached_file && (
                      <p className="mt-1 text-sm text-red-500">{errors.attached_file}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setErrors({});
                    }}
                    disabled={submitting}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Report Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Edit Report</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReport(null);
                    setErrors({});
                    setFormData({
                      name: user?.name || user?.username || '',
                      heading: '',
                      report_text: '',
                      report_date: new Date().toISOString().split('T')[0],
                      attached_file: null
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Heading */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="heading"
                      value={formData.heading}
                      onChange={handleInputChange}
                      placeholder="Brief heading for your report"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.heading ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.heading && (
                      <p className="mt-1 text-sm text-red-500">{errors.heading}</p>
                    )}
                  </div>

                  {/* Report Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="report_date"
                      value={formData.report_date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.report_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.report_date && (
                      <p className="mt-1 text-sm text-red-500">{errors.report_date}</p>
                    )}
                  </div>

                  {/* Report Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="report_text"
                      value={formData.report_text}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Describe your daily activities, accomplishments, and any issues encountered..."
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.report_text ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.report_text && (
                      <p className="mt-1 text-sm text-red-500">{errors.report_text}</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Update Attached File (Optional)
                    </label>
                    {editingReport?.attached_file && (
                      <p className="text-sm text-gray-600 mb-2">
                        Current file attached. Upload a new file to replace it.
                      </p>
                    )}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Max file size: 10MB. Accepted formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
                    </p>
                    {errors.attached_file && (
                      <p className="mt-1 text-sm text-red-500">{errors.attached_file}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingReport(null);
                      setErrors({});
                      setFormData({
                        name: user?.name || user?.username || '',
                        heading: '',
                        report_text: '',
                        report_date: new Date().toISOString().split('T')[0],
                        attached_file: null
                      });
                    }}
                    disabled={submitting}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-5 h-5" />
                        Update Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedReport.heading}
                    </h3>
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-5 h-5" />
                      <span className="font-medium">{selectedReport.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(selectedReport.report_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Report Content</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.report_text}
                  </p>
                </div>

                {selectedReport.attached_file && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(selectedReport.attached_file)}
                        <div>
                          <p className="font-semibold text-gray-900">Attached File</p>
                          <p className="text-sm text-gray-600">Click to download</p>
                        </div>
                      </div>
                      <a
                        href={selectedReport.attached_file}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {selectedReport.review_comment && (
                  <div className={`rounded-lg p-4 ${
                    selectedReport.status === 'rejected' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Review Comment</h4>
                    <p className="text-gray-700">{selectedReport.review_comment}</p>
                    {selectedReport.reviewed_by && (
                      <p className="text-sm text-gray-500 mt-2">
                        Reviewed by: {selectedReport.reviewed_by}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}