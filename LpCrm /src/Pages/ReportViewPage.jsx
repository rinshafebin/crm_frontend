import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/layouts/Navbar';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Download, 
  Check, 
  Trash2,
  Clock,
  Tag,
  FileCheck,
  XCircle,
  MessageSquare
} from 'lucide-react';

export default function ReportViewPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); 
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch report details
  const fetchReport = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/reports/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      alert('Failed to load report details');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id, accessToken]);

  // Open review modal
  const openReviewModal = (action) => {
    setReviewAction(action);
    setReviewComment('');
    setReviewModal(true);
  };

  // Handle review submission
  const handleReviewReport = async () => {
    if (!accessToken) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/admin/reports/${id}/review/`,
        { 
          status: reviewAction,
          review_comment: reviewComment
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(`Report ${reviewAction} successfully!`);
      setReviewModal(false);
      fetchReport(); // Refresh report data
    } catch (err) {
      console.error('Failed to review report:', err);
      alert('Failed to review report');
    } finally {
      setActionLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading report details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Report not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Get status badge
  const getStatusBadge = () => {
    if (report.status === 'approved') {
      return (
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
          <FileCheck size={16} />
          Approved
        </span>
      );
    } else if (report.status === 'rejected') {
      return (
        <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
          <XCircle size={16} />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
          <Clock size={16} />
          Pending Review
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/daily/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Reports</span>
        </button>

        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="text-indigo-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{report.report_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>{report.user_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {getStatusBadge()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {report.attached_file && (
              <a
                href={report.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Download size={18} />
                Download Report
              </a>
            )}
            {report.status !== 'approved' && report.status !== 'rejected' && (
              <>
                <button
                  onClick={() => openReviewModal('approved')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <Check size={18} />
                  Approve Report
                </button>
                <button
                  onClick={() => openReviewModal('rejected')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reject Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} />
                Report Type
              </label>
              <p className="text-gray-900">{report.type || report.heading || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} />
                Created By
              </label>
              <p className="text-gray-900">{report.user_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Report Date
              </label>
              <p className="text-gray-900">{report.report_date}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Attached File
              </label>
              <p className="text-gray-900">{report.attached_file || 'No file attached'}</p>
            </div>
          </div>
        </div>

        {/* Review Information */}
        {(report.status === 'approved' || report.status === 'rejected') && report.review_comment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Review Comment
            </h2>
            <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {report.review_comment}
            </div>
            {report.reviewed_by_name && (
              <p className="text-sm text-gray-600 mt-3">
                Reviewed by: {report.reviewed_by_name}
              </p>
            )}
          </div>
        )}

        {/* Report Description/Content */}
        {report.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="text-gray-700 whitespace-pre-wrap">
              {report.description}
            </div>
          </div>
        )}

        {/* Additional Content/Notes */}
        {report.notes && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <div className="text-gray-700 whitespace-pre-wrap">
              {report.notes}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {reviewAction === 'approved' ? 'Approve Report' : 'Reject Report'}
            </h3>
            <p className="text-gray-600 mb-4">
              {reviewAction === 'approved' 
                ? 'Are you sure you want to approve this report?' 
                : 'Please provide a reason for rejecting this report.'}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comment {reviewAction === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add your comment here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setReviewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewReport}
                className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  reviewAction === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={actionLoading || (reviewAction === 'rejected' && !reviewComment.trim())}
              >
                {actionLoading ? 'Processing...' : reviewAction === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Report</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{report.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}