import React from 'react';
import { Briefcase, Shield, Users, DollarSign } from 'lucide-react';
import { roleOptions, teamOptions } from '../../utils/staffConstants';

const ProfessionalInfoSection = React.memo(({ formData, errors, onChange }) => {
  return (
    <div className="mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase size={20} className="text-indigo-600" />
        Professional Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={onChange}
            className={`w-full px-3 sm:px-4 py-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base`}
          >
            <option value="">Select a role</option>
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Team */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            Team/Department
          </label>
          <select
            name="team"
            value={formData.team}
            onChange={onChange}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          >
            <option value="">Select a team</option>
            {teamOptions.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            Salary
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary || ''}
            onChange={onChange}
            placeholder="Enter salary"
            className={`w-full px-3 sm:px-4 py-2 border ${errors.salary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base`}
          />
          {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
        </div>

        {/* Status */}
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
