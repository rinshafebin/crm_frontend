import React from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

export default function StudentFormFields({
  formData,
  errors,
  trainers,
  trainersLoading,
  onFieldChange,
  batchChoices,
  classChoices,
  statusChoices,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <FormInput
        label="Student Name"
        name="name"
        value={formData.name}
        onChange={onFieldChange}
        placeholder="Enter student name"
        required
        error={errors.name}
        className="md:col-span-2"
      />

      {/* Batch */}
      <FormSelect
        label="Batch"
        name="batch"
        value={formData.batch}
        onChange={onFieldChange}
        options={batchChoices}
        placeholder="Select Batch"
        required
        error={errors.batch}
      />

      {/* Class */}
      <FormSelect
        label="Class"
        name="student_class"
        value={formData.student_class}
        onChange={onFieldChange}
        options={classChoices}
        placeholder="Select Class"
      />

      {/* Trainer */}
      <FormSelect
        label="Trainer"
        name="trainer"
        value={formData.trainer}
        onChange={onFieldChange}
        options={trainers.map(t => ({
          value: t.id,
          label: t.user_name || 
                 `${t.user?.first_name || ''} ${t.user?.last_name || ''}`.trim() || 
                 t.email || 
                 `Trainer ${t.id}`
        }))}
        placeholder={trainersLoading ? 'Loading trainers...' : 'Select Trainer'}
        required
        error={errors.trainer}
        disabled={trainersLoading}
        emptyMessage="No trainers available"
      />

      {/* Status */}
      <FormSelect
        label="Status"
        name="status"
        value={formData.status}
        onChange={onFieldChange}
        options={statusChoices}
        placeholder="Select Status"
      />

      {/* Admission Date */}
      <FormInput
        label="Admission Date"
        name="admission_date"
        type="date"
        value={formData.admission_date}
        onChange={onFieldChange}
        required
        error={errors.admission_date}
      />

      {/* Email */}
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={onFieldChange}
        placeholder="student@example.com"
        error={errors.email}
      />

      {/* Phone */}
      <FormInput
        label="Phone Number"
        name="phone_number"
        type="tel"
        value={formData.phone_number}
        onChange={onFieldChange}
        placeholder="1234567890"
        error={errors.phone_number}
      />

      {/* Drive Link */}
      <FormInput
        label="Drive Link"
        name="drive_link"
        type="url"
        value={formData.drive_link}
        onChange={onFieldChange}
        placeholder="https://drive.google.com/..."
        className="md:col-span-2"
      />

      {/* Notes */}
      <FormTextarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={onFieldChange}
        placeholder="Additional notes about the student..."
        rows={4}
        className="md:col-span-2"
      />
    </div>
  );
}