import React from 'react';
import { statusOptions, sourceOptions, priorityOptions, programOptions } from '../../utils/leadConstants';
import FormField from '../../common/FormField';
import RadioGroup from '../../common/RadioGroup';
import SectionHeader from '../../common/SectionHeader';
import { Tag, Calendar } from 'lucide-react';

export default function LeadDetailsSection({ formData, errors, onChange }) {
  return (
    <div className="mb-8 pt-8 border-t border-gray-200">
      <SectionHeader 
        title="Lead Details" 
        showAction={false}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program */}
        <FormField
          label="Program/Course"
          name="program"
          type="select"
          value={formData.program}
          onChange={onChange}
          icon={Tag}
          placeholder="Select a program"
          options={programOptions}
        />

        {/* Status */}
        <FormField
          label="Status"
          name="status"
          type="select"
          value={formData.status}
          onChange={onChange}
          icon={Calendar}
          options={statusOptions}
        />

        {/* Priority */}
        <div className="md:col-span-2">
          <RadioGroup
            label="Priority Level"
            name="priority"
            value={formData.priority}
            onChange={onChange}
            options={priorityOptions}
            columns={3}
          />
        </div>

        {/* Source */}
        <FormField
          label="Lead Source"
          name="source"
          type="select"
          value={formData.source}
          onChange={onChange}
          error={errors.source}
          required
          placeholder="Select source"
          options={sourceOptions}
        />

        {/* Custom Source */}
        {formData.source === 'OTHER' && (
          <FormField
            label="Custom Source (Specify)"
            name="customSource"
            value={formData.customSource}
            onChange={onChange}
            error={errors.customSource}
            required
            placeholder="Enter custom source"
          />
        )}
      </div>
    </div>
  );
}