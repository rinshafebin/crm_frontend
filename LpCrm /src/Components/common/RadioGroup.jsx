// Components/common/RadioGroup.jsx
import React from 'react';

export default function RadioGroup({ 
  name,
  value,
  onChange,
  options,
  columns = 3,
  label,
  className = ''
}) {
  const getOptionStyles = (option) => {
    const isSelected = value === option.value;
    
    // Priority-based colors
    const colorMap = {
      HIGH: {
        selected: 'border-red-500 bg-red-50 text-red-700',
        default: 'border-gray-300 hover:border-gray-400'
      },
      MEDIUM: {
        selected: 'border-yellow-500 bg-yellow-50 text-yellow-700',
        default: 'border-gray-300 hover:border-gray-400'
      },
      LOW: {
        selected: 'border-green-500 bg-green-50 text-green-700',
        default: 'border-gray-300 hover:border-gray-400'
      }
    };

    const colorConfig = colorMap[option.value] || {
      selected: 'border-indigo-500 bg-indigo-50 text-indigo-700',
      default: 'border-gray-300 hover:border-gray-400'
    };

    return isSelected ? colorConfig.selected : colorConfig.default;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className={`grid grid-cols-${columns} gap-4`}>
        {options.map(option => (
          <label
            key={option.value}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${getOptionStyles(option)}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4"
            />
            <span className="font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}