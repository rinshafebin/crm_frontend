// Components/tasks/PrioritySelector.jsx
import React from 'react';
import { Flag } from 'lucide-react';

export default function PrioritySelector({ 
  value, 
  onChange, 
  disabled = false 
}) {
  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-green-50 border-green-300 text-green-700', icon: '○' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 border-blue-300 text-blue-700', icon: '◐' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-50 border-orange-300 text-orange-700', icon: '◉' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-50 border-red-300 text-red-700', icon: '⬤' },
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <Flag className="w-4 h-4 text-indigo-600" />
        Priority Level
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {priorities.map((priority) => (
          <label
            key={priority.value}
            className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              value === priority.value
                ? priority.color + ' shadow-md scale-105'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="priority"
              value={priority.value}
              checked={value === priority.value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute opacity-0"
              disabled={disabled}
            />
            <span className="text-lg">{priority.icon}</span>
            <span className="font-semibold text-sm">{priority.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}