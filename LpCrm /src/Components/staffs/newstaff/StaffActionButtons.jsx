// src/components/staff/StaffActionButtons.jsx
import React from 'react';
import { Save } from 'lucide-react';

export default function StaffActionButtons({ onSubmit, onCancel }) {
  return (
    <div className="flex gap-4 pt-6 border-t border-gray-200">
      <button
        onClick={onSubmit}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
      >
        <Save size={20} />
        Save Staff Member
      </button>
      <button
        onClick={onCancel}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
      >
        Cancel
      </button>
    </div>
  );
}