import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, ExternalLink, UserCheck, Users, Eye, Activity, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsTable = ({ leads, statusColors, onDeleteLead, loading }) => {
  const navigate = useNavigate();

  const processingStatusColors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    on_hold: 'bg-orange-100 text-orange-700',
  };

  if (leads.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new lead to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      {loading && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-2 text-blue-700">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm font-medium">Loading leads...</span>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lead Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Processing</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assignment</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Lead Info */}
                <td className="px-6 py-5">
                  <div>
                    <p className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <ExternalLink size={12} className="opacity-50" />
                      {lead.interest || lead.program || 'No program'}
                    </p>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-blue-600" />
                      </div>
                      <span className="font-medium truncate max-w-[180px]" title={lead.email}>
                        {lead.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-green-600" />
                      </div>
                      <span className="font-medium">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-purple-600" />
                      </div>
                      <span className="font-medium truncate max-w-[180px]" title={lead.location}>
                        {lead.location}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${statusColors[lead.status]}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </td>

                {/* Source */}
                <td className="px-6 py-5">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                    {lead.source}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-6 py-5">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                    lead.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {lead.priority}
                  </span>
                </td>

                {/* Processing Status */}
                <td className="px-6 py-5">
                  {lead.processing_status ? (
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-gray-500 flex-shrink-0" />
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        processingStatusColors[lead.processing_status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.processing_status.replace('_', ' ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Not set</span>
                  )}
                </td>
                
                {/* Assignment - Two levels */}
                <td className="px-6 py-5">
                  <div className="space-y-2 min-w-[150px]">
                    {/* Primary Assignment */}
                    {lead.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserCheck size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Primary</p>
                          <p className="text-sm font-medium text-gray-900">
                            {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Sub Assignment */}
                    {lead.sub_assigned_to ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sub</p>
                          <p className="text-sm font-medium text-gray-900">
                            {lead.sub_assigned_to.first_name} {lead.sub_assigned_to.last_name}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Unassigned State */}
                    {!lead.assigned_to && !lead.sub_assigned_to && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserCheck size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 italic">
                          Unassigned
                        </span>
                      </div>
                    )}

                    {/* Current Handler Badge */}
                    {lead.current_handler && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <UserCheck size={12} />
                          Handler: {lead.current_handler.first_name}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-orange-600" />
                    </div>
                    <span className="whitespace-nowrap">{lead.date}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="group/btn p-2.5 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                      title="View details"
                    >
                      <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      className="group/btn p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                      title="Edit lead"
                    >
                      <Edit size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>

                    <button
                      onClick={() => onDeleteLead(lead.id)}
                      className="group/btn p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                      title="Delete lead"
                    >
                      <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;