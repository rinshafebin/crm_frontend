import React from 'react';
import { Calendar, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import Card from '../common/Card';

export default function DateSelector({ 
  selectedDate, 
  onDateChange, 
  onMarkAllPresent,
  selectedStudents,
  onBulkMarkSelected
}) {
  const hasSelection = selectedStudents.length > 0;

  return (
    <Card padding="p-6" className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            <label className="text-gray-700 font-semibold">Date:</label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Mark All Present Button */}
          <button
            onClick={onMarkAllPresent}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold flex items-center gap-2 border border-green-300"
          >
            <CheckCircle size={18} />
            Mark All Present
          </button>

          {/* Bulk Actions for Selected Students */}
          {hasSelection && (
            <>
              <button
                onClick={() => onBulkMarkSelected('PRESENT')}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-semibold flex items-center gap-2 border border-green-200"
              >
                <CheckCircle size={18} />
                Mark Selected Present
              </button>
              
              <button
                onClick={() => onBulkMarkSelected('ABSENT')}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-semibold flex items-center gap-2 border border-red-200"
              >
                <XCircle size={18} />
                Mark Selected Absent
              </button>
              
              <button
                onClick={() => onBulkMarkSelected('NO_SESSION')}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center gap-2 border border-gray-200"
              >
                <MinusCircle size={18} />
                Mark Selected No Session
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Selection Counter */}
      {hasSelection && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-indigo-600 font-semibold">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </Card>
  );
}