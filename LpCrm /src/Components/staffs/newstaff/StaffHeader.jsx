import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../common/Button';

const StaffHeader = React.memo(({ 
  onBack, 
  title = "Add New Staff Member", 
  subtitle = "Fill in the details to add a new team member" 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            onClick={onBack}
            variant="text"
            size="sm"
            icon={ArrowLeft}
            iconPosition="left"
            className="text-gray-600 hover:text-gray-900 !p-2"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

StaffHeader.displayName = 'StaffHeader';

export default StaffHeader;