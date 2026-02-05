import React from 'react';
import Button from '../../common/Button';
import { Save, Loader2, X } from 'lucide-react';

export default function StudentFormActions({
  onCancel,
  loading = false,
  disabled = false,
  submitLabel = 'Save Student',
}) {
  return (
    <div className="mt-8 flex gap-4 justify-end">
      <Button
        onClick={onCancel}
        variant="outline"
        size="lg"
        disabled={loading}
        icon={X}
        iconPosition="left"
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading || disabled}
        icon={loading ? Loader2 : Save}
        iconPosition="left"
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
