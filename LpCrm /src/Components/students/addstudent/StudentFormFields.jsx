// Components/students/StudentFormFields.jsx
import React from 'react';
import FormField from '../../common/FormField';
import { Mail, Phone, Link as LinkIcon } from 'lucide-react';

export default function StudentFormFields({
  formData,
  errors,
  trainers,
  trainersLoading,
  onChange,
  batchChoices,
  classChoices,
  statusChoices,
}) {
  // Transform trainers for select options
  const trainerOptions = trainers.map(trainer => ({
    value: trainer.id,
    label: trainer.user_name || 
      `${trainer.user?.first_name || ''} ${trainer.user?.last_name || ''}`.trim() || 
      trainer.email || 
      `Trainer ${trainer.id}`
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <FormField
        label="Student Name"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="Enter student name"
        required
        error={errors.name}
        className="md:col-span-2"
      />

      {/* Batch */}
      <FormField
        label="Batch"
        name="batch"
        type="select"
        value={formData.batch}
        onChange={onChange}
        options={batchChoices}
        placeholder="Select Batch"
        required
        error={errors.batch}
      />

      {/* Class */}
      <FormField
        label="Class"
        name="student_class"
        type="select"
        value={formData.student_class}
        onChange={onChange}
        options={classChoices}
        placeholder="Select Class"
      />

      {/* Trainer */}
      <div>
        <FormField
          label="Trainer"
          name="trainer"
          type="select"
          value={formData.trainer}
          onChange={onChange}
          options={trainerOptions}
          placeholder={trainersLoading ? 'Loading trainers...' : 'Select Trainer'}
          required
          error={errors.trainer}
        />
        {trainers.length === 0 && !trainersLoading && (
          <p className="mt-1 text-sm text-yellow-600">No trainers available</p>
        )}
      </div>

      {/* Status */}
      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={onChange}
        options={statusChoices}
        placeholder="Select Status"
      />

      {/* Admission Date */}
      <FormField
        label="Admission Date"
        name="admission_date"
        type="date"
        value={formData.admission_date}
        onChange={onChange}
        required
        error={errors.admission_date}
      />

      {/* Email */}
      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={onChange}
        placeholder="student@example.com"
        icon={Mail}
        error={errors.email}
      />

      {/* Phone */}
      <FormField
        label="Phone Number"
        name="phone_number"
        type="tel"
        value={formData.phone_number}
        onChange={onChange}
        placeholder="1234567890"
        icon={Phone}
        error={errors.phone_number}
      />

      {/* Drive Link */}
      <FormField
        label="Drive Link"
        name="drive_link"
        type="url"
        value={formData.drive_link}
        onChange={onChange}
        placeholder="https://drive.google.com/..."
        icon={LinkIcon}
        className="md:col-span-2"
      />

      {/* Notes */}
      <FormField
        label="Notes"
        name="notes"
        type="textarea"
        value={formData.notes}
        onChange={onChange}
        placeholder="Additional notes about the student..."
        rows={4}
        className="md:col-span-2"
      />
    </div>
  );
}