import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/layouts/Navbar';
import { 
  FileText, Plus, Send, X, Calendar, User, Clock,
  CheckCircle2, XCircle, AlertCircle, Download, Eye,
  Search, Loader2, Edit, FileSpreadsheet, File, Image, Paperclip
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
    attached_files: []
  });
  
  const [errors, setErrors] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const userName = user?.name || user?.username || 'User';

  // ── Helper: force-download via fetch → blob → programmatic click ─────────
  // The HTML <a download> attribute is silently ignored for cross-origin URLs.
  // Cloudinary is always cross-origin, so we fetch the bytes ourselves and
  // create a local blob: URL — that way the browser always respects `download`.
  const downloadFile = async (attachment) => {
    const url = attachment.download_url || attachment.view_url;
    if (!url) return;

    const filename = attachment.original_filename || url.split('/').pop().split('?')[0] || 'download';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, falling back to new tab:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FileText className="w-8 h-8 text-blue-600" />;
    const fileName = (typeof fileUrl === 'string' ? fileUrl : fileUrl.name || '').toLowerCase();
    if (fileName.match(/\.(xlsx|xls)$/)) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    if (fileName.includes('.pdf'))        return <File className="w-8 h-8 text-red-600" />;
    if (fileName.match(/\.(doc|docx)$/))  return <FileText className="w-8 h-8 text-blue-600" />;
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return <Image className="w-8 h-8 text-purple-600" />;
    return <FileText className="w-8 h-8 text-gray-600" />;
  };

  const getFileName = (file) => {
    if (file instanceof File) return file.name;
    if (typeof file === 'string') return file.split('/').pop().split('?')[0];
    return 'Unknown file';
  };

  const fetchWithAuth = async (url, options = {}) => {
    try {
      let token = accessToken;
      const response = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, ...options.headers },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Unable to refresh token');
        const retryResponse = await fetch(url, {
          ...options,
          headers: { 'Authorization': `Bearer ${token}`, ...options.headers },
        });
        if (!retryResponse.ok) throw new Error(`HTTP error! status: ${retryResponse.status}`);
        return await retryResponse.json();
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    if (accessToken) fetchReports();
  }, [accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const fileErrors = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        fileErrors.push(`${file.name} is too large (max 10MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (fileErrors.length > 0) {
      setErrors(prev => ({ ...prev, attached_files: fileErrors.join(', ') }));
      return;
    }

    setFormData(prev => ({ ...prev, attached_files: [...prev.attached_files, ...validFiles] }));
    setErrors(prev => ({ ...prev, attached_files: '' }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attached_files: prev.attached_files.filter((_, i) => i !== index)
    }));
  };

  // ✅ FIXED: resetForm should be a regular function, not return an object
  const resetForm = () => {
    setFormData({
      name: user?.name || user?.username || '',
      heading: '',
      report_text: '',
      report_date: new Date().toISOString().split('T')[0],
      attached_files: []
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.heading?.trim()) newErrors.heading = 'Heading is required';
    if (!formData.report_text?.trim()) newErrors.report_text = 'Report content is required';
    if (!formData.report_date) newErrors.report_date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('heading', formData.heading);
      formDataToSend.append('report_text', formData.report_text);
      formDataToSend.append('report_date', formData.report_date);
      formData.attached_files.forEach((file) => {
        formDataToSend.append('attached_files', file);
      });

      await fetchWithAuth(`${API_BASE_URL}/reports/`, {
        method: 'POST',
        body: formDataToSend,
      });

      setShowCreateModal(false);
      resetForm();
      setErrors({});
      await fetchReports();
    } catch (err) {
      console.error('Submit error:', err);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit report. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingReport) return;
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('heading', formData.heading);
      formDataToSend.append('report_text', formData.report_text);
      formDataToSend.append('report_date', formData.report_date);
      formData.attached_files.forEach((file) => {
        formDataToSend.append('attached_files', file);
      });

      await fetchWithAuth(`${API_BASE_URL}/reports/${editingReport.id}/`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      setShowEditModal(false);
      setEditingReport(null);
      resetForm();
      setErrors({});
      await fetchReports();
    } catch (err) {
      console.error('Update error:', err);
      setErrors(prev => ({ ...prev, submit: 'Failed to update report. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setFormData({
      name: report.name || '',
      heading: report.heading || '',
      report_text: report.report_text || '',
      report_date: report.report_date || '',
      attached_files: []
    });
    setShowEditModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Approved</span>;
    if (status === 'rejected') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Rejected</span>;
    return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200 inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />Pending</span>;
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = !searchTerm || 
      report.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_text?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ✅ MOVED OUTSIDE: FormFields component to prevent recreation on every render
  const FormFields = () => (
    <>
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Enter your name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Report Heading <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="heading"
          value={formData.heading}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Enter report heading"
        />
        {errors.heading && <p className="text-red-500 text-sm mt-1.5">{errors.heading}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Report Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="report_date"
          value={formData.report_date}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {errors.report_date && <p className="text-red-500 text-sm mt-1.5">{errors.report_date}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Report Content <span className="text-red-500">*</span>
        </label>
        <textarea
          name="report_text"
          value={formData.report_text}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          placeholder="Enter detailed report content..."
        />
        {errors.report_text && <p className="text-red-500 text-sm mt-1.5">{errors.report_text}</p>}
      </div>
    </>
  );

  const FileUploadSection = ({ label = "Attach Files (Optional)" }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Click to upload files</p>
          <p className="text-gray-400 text-sm">PDF, Word, Excel, Images (Max 10MB each)</p>
        </label>
      </div>
      {errors.attached_files && <p className="text-red-500 text-sm mt-1.5">{errors.attached_files}</p>}

      {formData.attached_files.length > 0 && (
        <div className="mt-4 space-y-2">
          {formData.attached_files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{getFileName(file)}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Reports
            </h1>
            <p className="text-gray-600 text-lg">Track and manage your submitted reports</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Report
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2.5 rounded-lg font-semibold transition-all capitalize ${
                    filter === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first report to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-indigo-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{report.heading}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{report.report_text}</p>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(report.report_date)}</span>
                  </div>
                  {report.attachments?.length > 0 && (
                    <div className="flex items-center gap-1 text-indigo-600">
                      <Paperclip className="w-4 h-4" />
                      <span>{report.attachments.length}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {report.status === 'pending' && (
                    <button
                      onClick={() => openEditModal(report)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Create Modal ─────────────────────────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Create New Report</h2>
                <button onClick={() => { setShowCreateModal(false); setErrors({}); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                {errors.submit && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errors.submit}</div>}
                <FormFields />
                <FileUploadSection />
                <div className="mt-8 flex gap-3 justify-end">
                  <button type="button" onClick={() => { setShowCreateModal(false); setErrors({}); resetForm(); }} disabled={submitting} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><Send className="w-5 h-5" />Submit Report</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ───────────────────────────────────────────────────── */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Edit Report</h2>
                <button onClick={() => { setShowEditModal(false); setEditingReport(null); setErrors({}); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                {errors.submit && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errors.submit}</div>}
                <FormFields />

                {editingReport?.attachments?.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Attachments</label>
                    <div className="space-y-2">
                      {editingReport.attachments.map((attachment, index) => (
                        <div key={attachment.id || index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          {getFileIcon(attachment.original_filename)}
                          <span className="text-sm text-gray-700 flex-1 truncate">
                            {attachment.original_filename || getFileName(attachment.view_url)}
                          </span>
                          <button
                            onClick={() => downloadFile(attachment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Existing attachments cannot be removed. You can only add new files.</p>
                  </div>
                )}

                <FileUploadSection label="Add New Files (Optional)" />

                <div className="mt-8 flex gap-3 justify-end">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingReport(null); setErrors({}); resetForm(); }} disabled={submitting} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleUpdate} disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Updating...</> : <><Edit className="w-5 h-5" />Update Report</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── View Modal ───────────────────────────────────────────────────── */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button onClick={() => setSelectedReport(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedReport.heading}</h3>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600"><User className="w-5 h-5" /><span className="font-medium">{selectedReport.name}</span></div>
                    <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-5 h-5" /><span>{formatDate(selectedReport.report_date)}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Report Content</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedReport.report_text}</p>
                </div>

                {/* Attachments */}
                {selectedReport.attachments?.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Attachments ({selectedReport.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedReport.attachments.map((attachment, index) => (
                        <div key={attachment.id || index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFileIcon(attachment.original_filename)}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {attachment.original_filename || getFileName(attachment.view_url)}
                              </p>
                              {attachment.uploaded_at && (
                                <p className="text-xs text-gray-500">Uploaded {formatDate(attachment.uploaded_at)}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadFile(attachment)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors ml-3"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.review_comment && (
                  <div className={`rounded-lg p-4 ${selectedReport.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Review Comment</h4>
                    <p className="text-gray-700">{selectedReport.review_comment}</p>
                    {selectedReport.reviewed_by_name && (
                      <p className="text-sm text-gray-500 mt-2">Reviewed by: {selectedReport.reviewed_by_name}</p>
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