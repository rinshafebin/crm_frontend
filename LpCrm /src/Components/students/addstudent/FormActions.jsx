import React from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function FormActions({
  onCancel,
  onSubmit,
  loading = false,
  disabled = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}) {
  return (
    <div className="mt-8 flex gap-4 justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        disabled={loading}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading || disabled}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={20} />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}