// src/components/staff/SecuritySection.jsx
import React from 'react';
import { Shield } from 'lucide-react';

export default function SecuritySection({ formData, errors, onChange }) {
  return (
    <div className="mb-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Shield size={20} className="text-indigo-600" />
        Security Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Enter password"
            className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="Confirm password"
            className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );
}