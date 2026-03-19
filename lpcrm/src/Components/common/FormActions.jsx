// Components/common/FormActions.jsx
import React from 'react';
import { Save } from 'lucide-react';

export default function FormActions({ 
  onCancel, 
  onSubmit,
  submitText = 'Save Changes',
  submittingText = 'Saving...',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitIcon: SubmitIcon = Save
}) {
  return (
    <div className="bg-slate-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-slate-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {cancelText}
      </button>
      <button
        type="submit"
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={isSubmitting}
      >
        <SubmitIcon size={18} />
        {isSubmitting ? submittingText : submitText}
      </button>
    </div>
  );
}