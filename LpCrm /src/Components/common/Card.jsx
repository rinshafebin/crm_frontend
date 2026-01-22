// Components/common/Card.jsx
import React from 'react';

export default function Card({ 
  children, 
  className = '',
  hover = true,
  padding = 'p-6',
  onClick
}) {
  const baseStyles = "bg-white rounded-2xl shadow-lg border border-gray-100 transition-all";
  const hoverStyles = hover ? "hover:shadow-xl hover:border-gray-200" : "";
  const clickableStyles = onClick ? "cursor-pointer" : "";
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}