// Components/common/Alert.jsx
import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ 
  type = 'info', 
  title, 
  message,
  children,
  className = '' 
}) {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      icon: XCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      icon: Info
    }
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          {title && (
            <p className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </p>
          )}
          {message && (
            <p className={`text-sm ${config.textColor}`}>
              {message}
            </p>
          )}
          {children && (
            <div className={`text-sm ${config.textColor}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}