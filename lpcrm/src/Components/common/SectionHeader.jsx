import React from 'react';

export default function SectionHeader({ 
  title, 
  actionText = 'View All',
  onActionClick,
  showAction = true 
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {showAction && (
        <button 
          onClick={onActionClick}
          className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors"
        >
          {actionText} →
        </button>
      )}
    </div>
  );
}