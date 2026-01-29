import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import Card from '../../common/Card';

export default function DateSelector({ 
  selectedDate, 
  onDateChange, 
  onMarkAllPresent 
}) {
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
        
        <button
          onClick={onMarkAllPresent}
          className="px-6 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold flex items-center gap-2 border border-green-300"
        >
          <CheckCircle size={18} />
          Mark All Present
        </button>
      </div>
    </Card>
  );
}