// Components/common/Badge.jsx
import React from 'react';

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) {
  const variants = {
    default: 'bg-gradient-to-r from-gray-600 to-slate-600 text-white',
    admin: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
    manager: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    staff: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
    high: 'bg-red-100 text-red-700 border border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    low: 'bg-green-100 text-green-700 border border-green-300'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };
  
  return (
    <span className={`rounded-full font-bold shadow-lg ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}