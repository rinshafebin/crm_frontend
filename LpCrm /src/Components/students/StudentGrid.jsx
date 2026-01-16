import React from 'react';
import StudentCard from './StudentCard';
import { Users } from 'lucide-react';

const StudentGrid = React.memo(({ students }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
});

StudentGrid.displayName = 'StudentGrid';

export default StudentGrid;