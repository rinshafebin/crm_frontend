import React from 'react';
import { Shield } from 'lucide-react';
import FormField from '../../common/FormField';
import IconContainer from '../../common/IconContainer';

const SecuritySection = React.memo(({ formData, errors, onChange, isEdit = false }) => {
  return (
    <div className="mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-gray-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <IconContainer 
          icon={Shield} 
          gradient="from-red-500 to-pink-600"
          size="sm"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Security Information
          </h2>
          <p className="text-sm text-gray-500 font-medium">Account credentials and access</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={onChange}
            error={errors.password}
            required={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
            className="px-4 py-3 border-2 rounded-xl font-medium"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
          required={!isEdit}
          placeholder="Confirm password"
          className="px-4 py-3 border-2 rounded-xl font-medium"
        />
      </div>
    </div>
  );
});

SecuritySection.displayName = 'SecuritySection';

export default SecuritySection;