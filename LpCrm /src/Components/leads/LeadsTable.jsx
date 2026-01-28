import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, ExternalLink, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsTable = ({ leads, statusColors, onDeleteLead, onEdit }) => {
  const navigate = useNavigate();

  if (leads.length === 0) {
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lead Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned To</th> {/* ADD THIS */}
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
                <td className="px-6 py-5">
                  <div>
                    <p className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <ExternalLink size={12} className="opacity-50" />
                      {lead.interest}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail size={14} className="text-blue-600" />
                      </div>
                      <span className="font-medium">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone size={14} className="text-green-600" />
                      </div>
                      <span className="font-medium">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin size={14} className="text-purple-600" />
                      </div>
                      <span className="font-medium">{lead.location}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${statusColors[lead.status]}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                    lead.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {lead.priority}
                  </span>
                </td>
                
                {/* ADD THIS NEW COLUMN */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      lead.assigned_to_name === 'Unassigned' 
                        ? 'bg-gray-100' 
                        : 'bg-teal-100'
                    }`}>
                      <UserCheck size={14} className={
                        lead.assigned_to_name === 'Unassigned' 
                          ? 'text-gray-400' 
                          : 'text-teal-600'
                      } />
                    </div>
                    <span className={`text-sm font-medium ${
                      lead.assigned_to_name === 'Unassigned' 
                        ? 'text-gray-400 italic' 
                        : 'text-gray-700'
                    }`}>
                      {lead.assigned_to_name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar size={14} className="text-orange-600" />
                    </div>
                    {lead.date}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
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