// Components/leads/newlead/AdditionalInfoSection.jsx - REFACTORED v2
import React from 'react';
import FormField from '../../common/FormField';
import SectionHeader from '../../common/SectionHeader';

export default function AdditionalInfoSection({ formData, onChange }) {
  return (
    <div className="mb-8 pt-8 border-t border-gray-200">
      <SectionHeader 
        title="Additional Information" 
        showAction={false}
      />
      <FormField
        label="Remarks / Notes"
        name="remarks"
        type="textarea"
        value={formData.remarks}
        onChange={onChange}
        rows={4}
        placeholder="Add any additional notes or remarks about this lead..."
      />
    </div>
  );
}