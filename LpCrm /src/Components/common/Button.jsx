// Components/common/Button.jsx
import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left'
}) {
  const baseStyles = "rounded-lg font-semibold transition-all duration-200 flex items-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50",
    text: "text-blue-600 hover:text-blue-700 hover:underline disabled:text-blue-300"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
}