// src/utils/staffConstants.js

export const roleOptions = [
  { value: 'ADMIN', label: 'General Manager' },
  { value: 'OPS', label: 'Operations Manager' },
  { value: 'ADM_MANAGER', label: 'Admission Manager' },
  { value: 'ADM_EXEC', label: 'Admission Executive' },
  { value: 'PROCESSING', label: 'Processing Executive' },
  { value: 'MEDIA', label: 'Media Team' },
  { value: 'TRAINER', label: 'Trainer' },
  { value: 'BUSINESS_HEAD', label: 'Business Head' },
  { value: 'BDM', label: 'Business Development Manager' },
  { value: 'CM', label: 'Center Manager' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'FOE', label: 'FOE Cum TC' }
];

export const teamOptions = [
  'Sales',
  'Marketing',
  'Development',
  'Support',
  'HR',
  'Finance',
  'Operations'
];

export const initialFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  location: '',
  role: '',
  team: '',
  dateJoined: new Date().toISOString().split('T')[0],
  isActive: true,
  password: '',
  confirmPassword: ''
};