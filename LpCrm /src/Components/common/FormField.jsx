// Components/common/FormField.jsx - ENHANCED VERSION
import React from 'react';
import { AlertCircle } from 'lucide-react';

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
  options, 
  className = '',
  min, 
  disabled = false
}) {
  const baseInputClasses = `w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`;
  
  const inputClasses = `${baseInputClasses} ${
    error ? 'border-red-500' : 'border-slate-200'
  } ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 4}
          disabled={disabled}
          className={`${inputClasses} text-slate-900`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputClasses} text-slate-900 appearance-none bg-no-repeat bg-right pr-10`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 1rem center'
          }}
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
        min={min}
        disabled={disabled}
        className={`${inputClasses} text-slate-900`}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
        {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}