import React from 'react';
import StudentCard from './StudentCard';

const StudentGrid = React.memo(({ students }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
});

StudentGrid.displayName = 'StudentGrid';

export default StudentGrid;