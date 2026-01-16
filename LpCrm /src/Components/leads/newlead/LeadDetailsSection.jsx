// src/components/leads/LeadDetailsSection.jsx
import React from 'react';
import { TrendingUp, Tag, Calendar } from 'lucide-react';
import { statusOptions, sourceOptions, priorityOptions, programOptions } from '../../utils/leadConstants';

export default function LeadDetailsSection({ formData, errors, onChange }) {
  return (
    <div className="mb-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-indigo-600" />
        Lead Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag size={16} className="text-gray-400" />
            Program/Course
          </label>
          <select
            name="program"
            value={formData.program}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a program</option>
            {programOptions.map(program => (
              <option
                key={program.value}
                value={program.value}
              >
                {program.label}
              </option>
            ))}

          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {priorityOptions.map(p => (
              <label
                key={p.value}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${formData.priority === p.value
                  ? p.value === 'HIGH'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : p.value === 'MEDIUM'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p.value}
                  checked={formData.priority === p.value}
                  onChange={onChange}
                  className="w-4 h-4"
                />
                <span className="font-medium">{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Source <span className="text-red-500">*</span>
          </label>
          <select
            name="source"
            value={formData.source}
            onChange={onChange}
            className={`w-full px-4 py-2 border ${errors.source ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">Select source</option>
            {sourceOptions.map(source => (
              <option key={source.value} value={source.value}>{source.label}</option>
            ))}
          </select>
          {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
        </div>

        {/* Custom Source */}
        {formData.source === 'OTHER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Source (Specify) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customSource"
              value={formData.customSource}
              onChange={onChange}
              placeholder="Enter custom source"
              className={`w-full px-4 py-2 border ${errors.customSource ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.customSource && <p className="text-red-500 text-xs mt-1">{errors.customSource}</p>}
          </div>
        )}
      </div>
    </div>
  );
}