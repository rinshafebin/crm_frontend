import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FormHeader({ onBack, title, subtitle }) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={20} />
        Back to Students
      </button>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}