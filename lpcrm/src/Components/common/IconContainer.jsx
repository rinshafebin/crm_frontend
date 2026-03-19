// Components/common/IconContainer.jsx
import React from 'react';

export default function IconContainer({ 
  icon: Icon, 
  gradient = 'from-blue-500 to-blue-600',
  size = 'md',
  hover = true 
}) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  };
  
  const hoverStyles = hover ? 'group-hover:scale-110' : '';
  
  return (
    <div className={`${sizes[size]} bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg ${hoverStyles} transition-transform`}>
      <Icon className={`${iconSizes[size]} text-white`} />
    </div>
  );
}