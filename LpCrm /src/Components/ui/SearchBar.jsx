import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  fullWidth = true,
  size = 'md',
  className = '',
  showClearButton = true,
  autoFocus = false
}) => {
  const [internalValue, setInternalValue] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledValue !== undefined ? onChange : setInternalValue;
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue?.(newValue);
    onChange?.(newValue);
  };
  
  const handleClear = () => {
    setValue?.('');
    onChange?.('');
    onClear?.();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };
  
  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-5 text-lg',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    
  };
  
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className={`${iconSizes[size]} text-gray-400`} />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          pl-10
          ${showClearButton && value ? 'pr-10' : 'pr-4'}
          border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
        `}
      />
      
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-lg transition-colors"
        >
          <X className={`${iconSizes[size]} text-gray-400 hover:text-gray-600`} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;