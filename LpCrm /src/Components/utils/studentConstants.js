export const BATCH_CHOICES = [
  { value: 'A1', label: 'A1 (Beginner)' },
  { value: 'A2', label: 'A2 (Elementary)' },
  { value: 'B1', label: 'B1 (Intermediate)' },
  { value: 'B2', label: 'B2 (Upper Intermediate)' },
  { value: 'A1 ONLINE', label: 'A1 (Online)' },
  { value: 'A2 ONLINE', label: 'A2 (Online)' },
  { value: 'B1 ONLINE', label: 'B1 (Online)' },
  { value: 'ONLINE', label: 'Online)' },
  { value: 'A1 EXAM PREPERATION', label: 'A1 (Exam Preparation)' },
  { value: 'A2 EXAM PREPERATION', label: 'A2 (Exam Preparation)' },
  { value: 'B1 EXAM PREPERATION', label: 'B1 (Exam Preparation)' },
  { value: 'B2 EXAM PREPERATION', label: 'B2 (Exam Preparation)' },
];

export const STATUS_CHOICES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
];

export const CLASS_CHOICES = [
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
  { value: 'C5', label: 'C5' },
  { value: 'C6', label: 'C6' },
  { value: 'C7', label: 'C7' },
  { value: 'C8', label: 'C8' },
  { value: 'C9', label: 'C9' },
  { value: 'C10', label: 'C10' },
  { value: 'C11', label: 'C11' },
  { value: 'C12', label: 'C12' },
  { value: 'C13', label: 'C13' },
  { value: 'C14', label: 'C14' },
  { value: 'C15', label: 'C15' },
  { value: 'C16', label: 'C16' },
  { value: 'C17', label: 'C17' },
  { value: 'C18', label: 'C18' },
  { value: 'C19', label: 'C19' },
  { value: 'C20', label: 'C20' },
  { value: 'ONLINE', label: 'Online' },
];

export const initialStudentFormData = {
  name: '',
  batch: '',
  trainer: '',
  status: 'ACTIVE',
  admission_date: new Date().toISOString().split('T')[0],
  student_class: '',
  email: '',
  phone_number: '',
  drive_link: '',
  notes: '',
};