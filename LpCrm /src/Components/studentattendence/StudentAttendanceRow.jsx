import React from 'react';
import StatusButton from './StatusButton';
import { statusOptions } from './constants';

export default function StudentAttendanceRow({ 
  student, 
  selectedStatus, 
  onStatusChange 
}) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Student Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
            alt={student.name}
            className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {student.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Batch {student.batch}</span>
              <span className="text-gray-400">•</span>
              <span>{student.student_class}</span>
            </div>
          </div>
        </div>

        {/* Status Buttons */}
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <StatusButton
              key={option.value}
              option={option}
              isSelected={selectedStatus === option.value}
              onClick={() => onStatusChange(student.id, option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}