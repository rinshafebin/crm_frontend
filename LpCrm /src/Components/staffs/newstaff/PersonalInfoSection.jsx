import React from 'react';
import { User, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const PersonalInfoSection = React.memo(({ formData, errors, onChange }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Personal Information
          </h2>
          <p className="text-sm text-gray-500 font-medium">Basic details about the staff member</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="Enter first name"
            className={`w-full px-4 py-3 border-2 ${
              errors.firstName 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Enter last name"
            className={`w-full px-4 py-3 border-2 ${
              errors.lastName 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            placeholder="Enter username"
            className={`w-full px-4 py-3 border-2 ${
              errors.username 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium`}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="group relative">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Mail size={16} className="text-blue-500" />
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="email@example.com"
            className={`w-full px-4 py-3 border-2 ${
              errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="group relative">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Phone size={16} className="text-green-500" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="+1 (555) 000-0000"
            className={`w-full px-4 py-3 border-2 ${
              errors.phone 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="group relative">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-purple-500" />
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            placeholder="Enter location"
            className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-100 rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
          />
        </div>
      </div>
    </div>
  );
});

PersonalInfoSection.displayName = 'PersonalInfoSection';

export default PersonalInfoSection;