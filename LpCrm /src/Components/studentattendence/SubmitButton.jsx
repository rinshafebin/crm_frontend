import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../common/Button';

export default function SubmitButton({ onSubmit, saving, disabled }) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onSubmit}
        disabled={saving || disabled}
        variant="primary"
        size="lg"
        icon={Save}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {saving ? 'Saving...' : 'Save Attendance'}
      </Button>
    </div>
  );
}