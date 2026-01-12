import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FilterDropdown = ({ 
  label = 'Filter',
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  fullWidth = false,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  
  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-5 text-lg',
  };
  
  return (
    <div 
      ref={dropdownRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          flex items-center justify-between
          bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
          ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}
        `}
      >
        <span className="flex items-center">
          {label && (
            <span className="text-gray-600 mr-2 font-medium">{label}:</span>
          )}
          {displayText}
        </span>
        <ChevronDown 
          className={`
            w-5 h-5 ml-2 text-gray-400 transition-transform duration-200
            ${isOpen ? 'transform rotate-180' : ''}
          `}
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value || index}
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-4 py-2 text-left flex items-center justify-between
                  hover:bg-gray-50 transition-colors duration-150
                  ${value === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'}
                `}
              >
                <span className="flex items-center">
                  {option.icon && (
                    <span className="mr-2">{option.icon}</span>
                  )}
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;