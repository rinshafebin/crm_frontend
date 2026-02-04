// Components/tasks/TaskFormFields.jsx
import React from 'react';
import { Calendar, User, FileText } from 'lucide-react';
import FormField from '../common/FormField';

export default function TaskFormFields({ 
  formData, 
  errors, 
  teamMembers, 
  onFieldChange, 
  disabled = false 
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      {/* Title Field */}
      <FormField
        label="Task Title"
        name="title"
        type="text"
        value={formData.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
        error={errors.title}
        required
        placeholder="Enter a clear and concise task title"
        icon={FileText}
        className={`bg-slate-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {/* Description Field */}
      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        error={errors.description}
        required
        placeholder="Provide detailed information about the task objectives and requirements"
        icon={FileText}
        rows={5}
        className={`bg-slate-50 resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assign To Field */}
        <FormField
          label="Assign To"
          name="assignTo"
          type="select"
          value={formData.assignTo}
          onChange={(e) => onFieldChange('assignTo', e.target.value)}
          error={errors.assignTo}
          required
          placeholder="Select team member"
          icon={User}
          options={teamMembers.map(member => ({
            value: member.id.toString(),
            label: `${member.username} — ${member.role.replace(/_/g, ' ')}`
          }))}
          className={`bg-slate-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Deadline Field */}
        <FormField
          label="Deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => onFieldChange('deadline', e.target.value)}
          error={errors.deadline}
          required
          icon={Calendar}
          className={`bg-slate-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}