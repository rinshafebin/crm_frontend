import React from 'react';
import { Mail, Phone, BookOpen, Calendar, Edit, Trash2, Eye, Award } from 'lucide-react';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  inactive: 'bg-red-100 text-red-700'
};

const gradeColors = {
  'A+': 'text-green-600',
  'A': 'text-green-600',
  'B+': 'text-blue-600',
  'B': 'text-blue-600',
  'C': 'text-yellow-600',
  'D': 'text-orange-600',
  'F': 'text-red-600'
};

const StudentCard = React.memo(({ student }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={student.avatar} 
            alt={student.name}
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[student.status]}`}>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Award className={gradeColors[student.grade]} size={18} />
            <span className={`font-bold text-lg ${gradeColors[student.grade]}`}>{student.grade}</span>
          </div>
          <span className="text-xs text-gray-500">Grade</span>
        </div>
      </div>

      {/* Course Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <BookOpen size={16} className="text-indigo-600" />
          <span className="font-medium">{student.course}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          Enrolled: {student.enrollmentDate}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Course Progress</span>
          <span className="text-sm font-bold text-indigo-600">{student.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${student.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          {student.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          {student.phone}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium">
          <Eye size={16} />
          View Profile
        </button>
        <button className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium">
          <Edit size={16} />
          Edit
        </button>
        <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
});

StudentCard.displayName = 'StudentCard';

export default StudentCard;