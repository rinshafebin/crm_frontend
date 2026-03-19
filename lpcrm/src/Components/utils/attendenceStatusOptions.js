import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export const attendenceStatusOptions = [
  {
    value: 'PRESENT',
    label: 'Present',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    value: 'ABSENT',
    label: 'Absent',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-300'
  },
  {
    value: 'NO_SESSION',
    label: 'No Session',
    icon: MinusCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-300'
  }
];