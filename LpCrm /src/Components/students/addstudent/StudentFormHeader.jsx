// Components/students/StudentFormHeader.jsx
import React from 'react';
import Button from '../../common/Button';
import { ArrowLeft } from 'lucide-react';

export default function StudentFormHeader({ 
  onBack, 
  title = "Add New Student", 
  subtitle = "Fill in the student information below" 
}) {
  return (
    <div className="mb-8">
      <Button
        onClick={onBack}
        variant="text"
        size="sm"
        icon={ArrowLeft}
        iconPosition="left"
        className="text-gray-600 hover:text-gray-900 mb-4 !p-1"
      >
        Back to Students
      </Button>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}