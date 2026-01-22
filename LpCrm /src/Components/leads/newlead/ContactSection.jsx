import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import FormField from '../../common/FormField';
import SectionHeader from '../../common/SectionHeader';

export default function ContactSection({ formData, errors, onChange }) {
  return (
    <div className="mb-8">
      <SectionHeader 
        title="Contact Information" 
        showAction={false}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <FormField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={onChange}
            error={errors.name}
            required
            placeholder="Enter lead's full name"
          />
        </div>

        {/* Phone */}
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={onChange}
          error={errors.phone}
          required
          icon={Phone}
          placeholder="Enter phone number"
        />

        {/* Email */}
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          icon={Mail}
          placeholder="email@example.com"
        />

        {/* Location */}
        <div className="md:col-span-2">
          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={onChange}
            icon={MapPin}
            placeholder="Enter location"
          />
        </div>
      </div>
    </div>
  );
}