import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ 
  title, 
  description, 
  onBack, 
  backText = 'Back',
  disabled = false 
}) {
  return (
    <>
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
          disabled={disabled}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{backText}</span>
        </button>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
        {description && (
          <p className="text-slate-600">{description}</p>
        )}
      </div>
    </>
  );
}