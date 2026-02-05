export const BATCH_CHOICES = [
  { value: 'A1', label: 'A1 (Beginner)' },
  { value: 'A2', label: 'A2 (Elementary)' },
  { value: 'B1', label: 'B1 (Intermediate)' },
  { value: 'B2', label: 'B2 (Upper Intermediate)' },
  { value: 'A1 ONLINE', label: 'A1 (Online)' },
  { value: 'A2 ONLINE', label: 'A2 (Online)' },
  { value: 'B1 ONLINE', label: 'B1 (Online)' },
  { value: 'B2 ONLINE', label: 'B2 (Online)' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'A1 EXAM PREPARATION', label: 'A1 (Exam Preparation)' },
  { value: 'A2 EXAM PREPARATION', label: 'A2 (Exam Preparation)' },
  { value: 'B1 EXAM PREPARATION', label: 'B1 (Exam Preparation)' },
  { value: 'B2 EXAM PREPARATION', label: 'B2 (Exam Preparation)' },
];

export const STATUS_CHOICES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
];

export const initialStudentFormData = {
  name: '',
  batch: '',
  student_class: '',
  trainer: '',
  status: 'ACTIVE',
  admission_date: new Date().toISOString().split('T')[0],
  email: '',
  phone_number: '',
  drive_link: '',
  notes: '',
};
