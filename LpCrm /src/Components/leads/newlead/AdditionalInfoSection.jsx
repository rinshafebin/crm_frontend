// src/components/leads/AdditionalInfoSection.jsx
import React from 'react';
import { FileText } from 'lucide-react';

export default function AdditionalInfoSection({ formData, onChange }) {
  return (
    <div className="mb-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-indigo-600" />
        Additional Information
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Remarks / Notes
        </label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={onChange}
          rows="4"
          placeholder="Add any additional notes or remarks about this lead..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
    </div>
  );
}