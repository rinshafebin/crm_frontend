import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Tag, 
  FileText, TrendingUp, Clock, Edit, Trash2, UserCheck,
  Users, History, AlertCircle, CheckCircle, XCircle, Loader2,
  ChevronRight, Package, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/layouts/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LeadDetailPage() {
  const { id: leadId } = useParams();
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();

  const [lead, setLead] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [processingTimeline, setProcessingTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Auth fetch
  const authFetch = useCallback(async (url, options = {}, retry = true) => {
    if (!accessToken) throw new Error('No access token');

    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error('Session expired');
      return authFetch(url, options, false);
    }

    return res;
  }, [accessToken, refreshAccessToken]);

  // Fetch lead details
  useEffect(() => {
    const fetchLeadDetails = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        const data = await res.json();
        setLead(data);
      } catch (err) {
        console.error('Failed to load lead:', err);
        alert('Failed to load lead details');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchLeadDetails();
    }
  }, [leadId, accessToken, authFetch, navigate]);

  // Fetch assignment history
  useEffect(() => {
    const fetchAssignmentHistory = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/assignment-history/`);
        if (res.ok) {
          const data = await res.json();
          setAssignmentHistory(data);
        }
      } catch (err) {
        console.error('Failed to load assignment history:', err);
      }
    };

    if (accessToken && leadId) {
      fetchAssignmentHistory();
    }
  }, [leadId, accessToken, authFetch]);

  // Fetch processing timeline
  useEffect(() => {
    const fetchProcessingTimeline = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/timeline/`);
        if (res.ok) {
          const data = await res.json();
          setProcessingTimeline(data);
        }
      } catch (err) {
        console.error('Failed to load processing timeline:', err);
      }
    };

    if (accessToken && leadId) {
      fetchProcessingTimeline();
    }
  }, [leadId, accessToken, authFetch]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/leads/${leadId}/`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete lead');
      
      alert('Lead deleted successfully');
      navigate('/leads');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete lead');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'ENQUIRY': 'bg-blue-100 text-blue-700 border-blue-200',
      'CONTACTED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'QUALIFIED': 'bg-purple-100 text-purple-700 border-purple-200',
      'CONVERTED': 'bg-green-100 text-green-700 border-green-200',
      'REGISTERED': 'bg-teal-100 text-teal-700 border-teal-200',
      'LOST': 'bg-red-100 text-red-700 border-red-200',
    };
    return statusMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'HIGH': 'bg-red-100 text-red-700 border-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'LOW': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return priorityMap[priority?.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getProcessingStatusColor = (status) => {
    const statusMap = {
      'PENDING': 'bg-gray-100 text-gray-700',
      'FORWARDED': 'bg-blue-100 text-blue-700',
      'ACCEPTED': 'bg-green-100 text-green-700',
      'PROCESSING': 'bg-yellow-100 text-yellow-700',
      'COMPLETED': 'bg-emerald-100 text-emerald-700',
      'REJECTED': 'bg-red-100 text-red-700',
    };
    return statusMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading lead details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lead Not Found</h2>
            <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/leads')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Leads</span>
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
              <p className="text-gray-600 mt-1">Lead Details & Information</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/leads/edit/${leadId}`)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(lead.status)}`}>
            {lead.status}
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(lead.priority)}`}>
            {lead.priority} Priority
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getProcessingStatusColor(lead.processing_status)}`}>
            {lead.processing_status?.replace('_', ' ')}
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <FileText className="inline-block mr-2" size={18} />
                Details
              </button>
              <button
                onClick={() => setActiveTab('assignment')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'assignment'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block mr-2" size={18} />
                Assignment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <History className="inline-block mr-2" size={18} />
                History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-semibold text-gray-900">{lead.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-semibold text-gray-900">{lead.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">{lead.location || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created On</p>
                        <p className="font-semibold text-gray-900">{formatDate(lead.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-indigo-600" />
                    Lead Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Program/Course</p>
                      <p className="font-semibold text-gray-900">{lead.program || 'Not specified'}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Source</p>
                      <p className="font-semibold text-gray-900">
                        {lead.source === 'OTHER' && lead.custom_source 
                          ? lead.custom_source 
                          : lead.source}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Document Status</p>
                      <p className="font-semibold text-gray-900">{lead.document_status || 'PENDING'}</p>
                    </div>
                    
                    {lead.registration_date && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Registration Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(lead.registration_date)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                {lead.remarks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-indigo-600" />
                      Remarks
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{lead.remarks}</p>
                    </div>
                  </div>
                )}

                {/* Processing Notes */}
                {lead.processing_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package size={20} className="text-indigo-600" />
                      Processing Notes
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{lead.processing_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignment' && (
              <div className="space-y-6">
                {/* Current Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck size={20} className="text-indigo-600" />
                    Current Assignment
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Primary Assignment */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Primary Assignment</h4>
                        <Award size={20} className="text-indigo-600" />
                      </div>
                      
                      {lead.assigned_to ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {lead.assigned_to.first_name?.[0] || lead.assigned_to.username?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{lead.assigned_to.role}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-600">Assigned By</p>
                              <p className="font-medium text-gray-900">
                                {lead.assigned_by 
                                  ? `${lead.assigned_by.first_name} ${lead.assigned_by.last_name}`
                                  : 'System'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Assigned On</p>
                              <p className="font-medium text-gray-900">{formatDate(lead.assigned_date)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Not assigned to anyone</p>
                        </div>
                      )}
                    </div>

                    {/* Sub Assignment */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Sub Assignment</h4>
                        <ChevronRight size={20} className="text-purple-600" />
                      </div>
                      
                      {lead.sub_assigned_to ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {lead.sub_assigned_to.first_name?.[0] || lead.sub_assigned_to.username?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {lead.sub_assigned_to.first_name} {lead.sub_assigned_to.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{lead.sub_assigned_to.role}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-600">Sub-Assigned By</p>
                              <p className="font-medium text-gray-900">
                                {lead.sub_assigned_by 
                                  ? `${lead.sub_assigned_by.first_name} ${lead.sub_assigned_by.last_name}`
                                  : 'System'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Sub-Assigned On</p>
                              <p className="font-medium text-gray-900">{formatDate(lead.sub_assigned_date)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No sub-assignment</p>
                        </div>
                      )}
                    </div>

                    {/* Current Handler */}
                    {lead.current_handler && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Current Handler</p>
                        <div className="flex items-center gap-3">
                          <CheckCircle size={20} className="text-green-600" />
                          <p className="font-semibold text-gray-900">
                            {lead.current_handler.first_name} {lead.current_handler.last_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment History */}
                {assignmentHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <History size={20} className="text-indigo-600" />
                      Assignment History
                    </h3>
                    <div className="space-y-3">
                      {assignmentHistory.map((assignment, index) => (
                        <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  assignment.assignment_type === 'PRIMARY' 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {assignment.assignment_type}
                                </span>
                                <span className="text-sm text-gray-500">{formatDate(assignment.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-900">
                                <span className="font-semibold">
                                  {assignment.assigned_to?.first_name} {assignment.assigned_to?.last_name}
                                </span>
                                {' '}was assigned by{' '}
                                <span className="font-semibold">
                                  {assignment.assigned_by?.first_name} {assignment.assigned_by?.last_name}
                                </span>
                              </p>
                              {assignment.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">"{assignment.notes}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Processing Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-indigo-600" />
                    Processing Timeline
                  </h3>
                  
                  {processingTimeline.length > 0 ? (
                    <div className="space-y-3">
                      {processingTimeline.map((update, index) => (
                        <div key={update.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(update.status)}`}>
                                  {update.status?.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">{formatDate(update.timestamp)}</span>
                              </div>
                              {update.changed_by && (
                                <p className="text-sm text-gray-700 mb-1">
                                  Changed by: <span className="font-semibold">
                                    {update.changed_by.first_name} {update.changed_by.last_name}
                                  </span>
                                </p>
                              )}
                              {update.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <FileText className="inline-block mr-1" size={14} />
                                  {update.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No processing history available</p>
                    </div>
                  )}
                </div>

                {/* Last Updated */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-900">{formatDate(lead.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}