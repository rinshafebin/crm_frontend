import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  
  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
        <p className="text-red-800 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
