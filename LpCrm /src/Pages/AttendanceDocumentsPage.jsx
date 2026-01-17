import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/layouts/Navbar';
import { 
  FileText, 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  Clock,
  Download,
  Eye,
  Search,
  Loader2,
  Trash2,
  Filter,
  ChevronDown,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AttendanceDocumentsPage() {
  const { accessToken, refreshAccessToken, user } = useAuth();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const [formData, setFormData] = useState({
    document_name: '',
    month: new Date().toISOString().slice(0, 7), 
    date: new Date().toISOString().split('T')[0],
    file: null
  });
  
  const [errors, setErrors] = useState({});

  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value, label });
    }
    return months;
  };

  const monthOptions = getMonthOptions();

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

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/attendance/`);
      setDocuments(data.results || data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDocuments();
    }
  }, [accessToken]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.document_name.trim()) {
      newErrors.document_name = 'Document name is required';
    }
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.file) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setUploading(true);
    
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const submitData = new FormData();
      submitData.append('document_name', formData.document_name);
      submitData.append('month', formData.month);
      submitData.append('date', formData.date);
      submitData.append('file', formData.file);

      const response = await fetch(`${API_BASE_URL}/api/hr/attendance/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      // Success
      setShowUploadModal(false);
      setFormData({
        document_name: '',
        month: new Date().toISOString().slice(0, 7),
        date: new Date().toISOString().split('T')[0],
        file: null
      });
      setErrors({});
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      setErrors({ submit: err.message || 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/api/hr/attendance/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format month
  const formatMonth = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesMonth = selectedMonth === 'all' || doc.month === selectedMonth;
    const matchesSearch = doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesSearch;
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
                Attendance Documents
              </h1>
              <p className="text-gray-600 text-lg">
                Upload and manage monthly attendance records
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              Upload Document
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
                placeholder="Search documents by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Month Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer font-semibold text-gray-700"
              >
                <option value="all">All Months</option>
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedMonth !== 'all' 
                ? 'Try adjusting your filters or search term'
                : 'Get started by uploading your first attendance document'}
            </p>
            {!searchTerm && selectedMonth === 'all' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Uploaded At
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{doc.document_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatMonth(doc.month)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatDate(doc.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={doc.file}
                              download
                              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate">
                        {doc.document_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatMonth(doc.month)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-gray-700">{formatDate(doc.date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="font-medium text-gray-700">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={doc.file}
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Upload Attendance Document</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setErrors({});
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Document Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Document Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="document_name"
                      value={formData.document_name}
                      onChange={handleInputChange}
                      placeholder="e.g., November 2024 Attendance Sheet"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.document_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.document_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.document_name}</p>
                    )}
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.month ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.month && (
                      <p className="mt-1 text-sm text-red-500">{errors.month}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attendance File <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors ${
                          errors.file ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {formData.file ? formData.file.name : 'Click to upload file'}
                        </span>
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Max file size: 10MB. Accepted formats: PDF, Excel, CSV, Word
                    </p>
                    {errors.file && (
                      <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setErrors({});
                    }}
                    disabled={uploading}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}