import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon: Icon,
  dot = false,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    completed: 'bg-purple-100 text-purple-800',
    pending: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span 
          className={`
            w-1.5 h-1.5 rounded-full mr-1.5
            ${variant === 'success' || variant === 'active' ? 'bg-green-600' : ''}
            ${variant === 'danger' || variant === 'inactive' || variant === 'urgent' ? 'bg-red-600' : ''}
            ${variant === 'warning' || variant === 'pending' ? 'bg-orange-600' : ''}
            ${variant === 'primary' ? 'bg-indigo-600' : ''}
            ${variant === 'purple' || variant === 'completed' ? 'bg-purple-600' : ''}
          `}
        />
      )}
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

export default Badge;