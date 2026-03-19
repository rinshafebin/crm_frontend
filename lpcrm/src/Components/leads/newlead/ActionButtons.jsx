// Components/leads/newlead/ActionButtons.jsx
import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../common/Button';

export default function ActionButtons({ onSave, onCancel }) {
  return (
    <div className="flex gap-4 pt-6 border-t border-gray-200">
      <Button
        onClick={onSave}
        variant="primary"
        icon={Save}
        className="flex-1"
      >
        Save Lead
      </Button>
      <Button
        onClick={onCancel}
        variant="outline"
      >
        Cancel
      </Button>
    </div>
  );
}