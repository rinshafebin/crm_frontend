import React from 'react';
import { Mail, Phone, BookOpen, Calendar, Edit, Trash2, Eye, User } from 'lucide-react';

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-red-100 text-red-700',
};

const StudentCard = React.memo(({ student }) => {
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={student.name}
            className="w-16 h-16 rounded-full bg-gray-200"
          />

          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {student.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[student.status]}`}
            >
              {student.status}
            </span>
          </div>
        </div>

        <div className="text-right text-sm text-gray-600">
          <User size={16} className="inline mr-1" />
          {student.trainer_name}
          <div className="text-xs text-gray-500 mt-1">
            Batch {student.batch}
          </div>
        </div>
      </div>

      {/* Class & Admission */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <BookOpen size={16} className="text-indigo-600" />
          <span className="font-medium">
            Class: {student.student_class}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          Admitted: {student.admission_date}
        </div>
      </div>

      {/* Notes */}
      {student.notes && (
        <div className="text-sm text-gray-600 mb-4">
          {student.notes}
        </div>
      )}

      {/* Contact */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          {student.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          {student.phone_number}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
          <Eye size={16} />
          View
        </button>

        <button className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
          <Edit size={16} />
          Edit
        </button>

        <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
});

StudentCard.displayName = 'StudentCard';
export default StudentCard;
