import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../common/Button';

export default function AttendanceDocHeader({ onUploadClick }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Attendance Documents
          </h1>
          <p className="text-gray-600 text-lg">
            Upload and manage monthly attendance records
          </p>
        </div>
        <Button
          onClick={onUploadClick}
          variant="primary"
          icon={Plus}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Upload Document
        </Button>
      </div>
    </div>
  );
}