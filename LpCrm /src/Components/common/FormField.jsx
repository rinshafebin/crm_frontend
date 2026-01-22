// Components/common/FormField.jsx
import React from 'react';

export default function FormField({ 
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  icon: Icon,
  rows,
  options, // For select dropdowns
  className = ''
}) {
  const inputClasses = `w-full px-4 py-2 border ${
    error ? 'border-red-500' : 'border-gray-300'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 4}
          className={`${inputClasses} resize-none`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
      />
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}