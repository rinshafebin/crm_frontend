import React from 'react';
import { Save, X } from 'lucide-react';
import Button from '../../common/Button';

const StaffActionButtons = React.memo(({ onSubmit, onCancel, isEdit = false }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
      <Button
        onClick={onSubmit}
        variant="primary"
        size="lg"
        icon={Save}
        iconPosition="left"
        className="w-full sm:flex-1"
      >
        {isEdit ? 'Update Staff Member' : 'Save Staff Member'}
      </Button>
      
      <Button
        onClick={onCancel}
        variant="outline"
        size="lg"
        icon={X}
        iconPosition="left"
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
    </div>
  );
});

StaffActionButtons.displayName = 'StaffActionButtons';

export default StaffActionButtons;