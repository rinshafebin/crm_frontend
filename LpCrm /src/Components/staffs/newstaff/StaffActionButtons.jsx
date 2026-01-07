// src/components/staff/StaffActionButtons.jsx
import React from 'react';
import { Save } from 'lucide-react';

const StaffActionButtons = React.memo(({ onSubmit, onCancel, isEdit = false }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
      <button
        onClick={onSubmit}
        className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 text-sm sm:text-base"
      >
        <Save size={20} />
        {isEdit ? 'Update Staff Member' : 'Save Staff Member'}
      </button>
      <button
        onClick={onCancel}
        className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
      >
        Cancel
      </button>
    </div>
  );
});

StaffActionButtons.displayName = 'StaffActionButtons';

export default StaffActionButtons;