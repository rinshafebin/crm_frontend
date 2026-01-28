import React from 'react';
import { Briefcase, Shield, Users, DollarSign } from 'lucide-react';
import FormField from '../../common/FormField';
import IconContainer from '../../common/IconContainer';
import { roleOptions, teamOptions } from '../../utils/staffConstants';

const ProfessionalInfoSection = React.memo(({ formData, errors, onChange }) => {
  return (
    <div className="mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-gray-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <IconContainer 
          icon={Briefcase} 
          gradient="from-indigo-500 to-purple-600"
          size="sm"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Professional Information
          </h2>
          <p className="text-sm text-gray-500 font-medium">Role and team details</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField
          label="Role"
          name="role"
          type="select"
          value={formData.role}
          onChange={onChange}
          error={errors.role}
          required
          placeholder="Select a role"
          icon={Shield}
          options={roleOptions}
          className="px-4 py-3 border-2 rounded-xl font-medium"
        />

        <FormField
          label="Team/Department"
          name="team"
          type="select"
          value={formData.team}
          onChange={onChange}
          placeholder="Select a team"
          icon={Users}
          options={teamOptions.map(team => ({ value: team, label: team }))}
          className="px-4 py-3 border-2 rounded-xl font-medium"
        />

        <FormField
          label="Salary"
          name="salary"
          type="number"
          value={formData.salary || ''}
          onChange={onChange}
          error={errors.salary}
          placeholder="Enter salary"
          icon={DollarSign}
          className="px-4 py-3 border-2 rounded-xl font-medium"
        />

        {/* Active Status Checkbox */}
        <div className="flex items-center sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Active Status (Staff member is active)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
});

ProfessionalInfoSection.displayName = 'ProfessionalInfoSection';

export default ProfessionalInfoSection;