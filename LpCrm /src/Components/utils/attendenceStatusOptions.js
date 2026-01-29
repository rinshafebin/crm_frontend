import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const attendenceStatusOptions = [
  { 
    value: 'PRESENT', 
    label: 'Present', 
    color: 'bg-green-100 text-green-700 border-green-300', 
    icon: CheckCircle 
  },
  { 
    value: 'ABSENT', 
    label: 'Absent', 
    color: 'bg-red-100 text-red-700 border-red-300', 
    icon: XCircle 
  },
  { 
    value: 'LATE', 
    label: 'Late', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
    icon: Clock 
  },
];