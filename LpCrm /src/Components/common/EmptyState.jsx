// Components/common/EmptyState.jsx
import React from 'react';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description,
  iconColor = 'text-gray-400',
  bgColor = 'bg-gray-100'
}) {
  return (
    <div className="text-center py-12">
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      {description && (
        <p className="text-gray-400 text-xs mt-1">{description}</p>
      )}
    </div>
  );
}