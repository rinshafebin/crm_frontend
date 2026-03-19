import React from 'react';

export default function StatusButton({ option, isSelected, onClick }) {
  const Icon = option.icon;
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
        isSelected
          ? option.color + ' shadow-md scale-105'
          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
      }`}
    >
      <Icon size={16} />
      {option.label}
    </button>
  );
}