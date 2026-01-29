import React from 'react';
import { Users } from 'lucide-react';
import Card from '../../common/Card';
import StudentAttendanceRow from './StudentAttendanceRow';
import EmptyState from '../../common/EmptyState';

export default function StudentAttendanceList({ 
  students, 
  attendanceRecords, 
  onStatusChange, 
  loading 
}) {
  return (
    <Card padding="p-0" className="mb-6 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-indigo-600" />
          Student Attendance ({students.length})
        </h2>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="p-12">
          <EmptyState
            icon={Users}
            title="No active students found"
            description="There are no active students to mark attendance for"
          />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {students.map((student) => (
            <StudentAttendanceRow
              key={student.id}
              student={student}
              selectedStatus={attendanceRecords[student.id]}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </Card>
  );
}