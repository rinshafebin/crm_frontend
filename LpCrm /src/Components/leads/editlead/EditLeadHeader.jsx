// Components/leads/editlead/EditLeadHeader.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function EditLeadHeader({ onBack, leadName }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Lead {leadName && `- ${leadName}`}
            </h1>
            <p className="text-sm text-gray-600">Update the lead information below</p>
          </div>
        </div>
      </div>
    </div>
  );
}