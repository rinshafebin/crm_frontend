import React from 'react';

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
  className = '',
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}