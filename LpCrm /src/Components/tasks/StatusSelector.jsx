// Components/tasks/StatusSelector.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function StatusSelector({ 
  value, 
  onChange, 
  disabled = false 
}) {
  const statuses = [
    { value: 'PENDING', label: 'Pending', color: 'bg-gray-50 border-gray-300 text-gray-700' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-300 text-green-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-50 border-slate-300 text-slate-600' },
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <AlertCircle className="w-4 h-4 text-indigo-600" />
        Task Status
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statuses.map((status) => (
          <label
            key={status.value}
            className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              value === status.value
                ? status.color + ' shadow-md scale-105'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="status"
              value={status.value}
              checked={value === status.value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute opacity-0"
              disabled={disabled}
            />
            <span className="font-semibold text-sm">{status.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}