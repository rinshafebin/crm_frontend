import React from 'react';
import AttendanceDocTableView from './AttendanceDocTableView';
import AttendanceDocMobileView from './AttendanceDocMobileView';

export default function AttendanceDocumentsList({ documents, onDelete }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <AttendanceDocTableView documents={documents} onDelete={onDelete} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <AttendanceDocMobileView documents={documents} onDelete={onDelete} />
      </div>
    </>
  );
}