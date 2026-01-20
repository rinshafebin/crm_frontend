import React from 'react';

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
  className = '',
  emptyMessage,
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {emptyMessage && options.length === 0 && !disabled && (
        <p className="mt-1 text-sm text-yellow-600">{emptyMessage}</p>
      )}
    </div>
  );
}