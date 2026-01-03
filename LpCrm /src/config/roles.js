// src/config/roles.js
import { Users, UserCheck, ListTodo, FileText, GraduationCap, Settings } from 'lucide-react';

// Define what each role can see
export const roleNavigation = {
  ADMIN: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/leads' },
    { id: 'staff', label: 'Staff', icon: UserCheck, path: '/staff' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'students', label: 'Students', icon: GraduationCap, path: '/students' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ],
  
  SUPER_ADMIN: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/leads' },
    { id: 'staff', label: 'Staff', icon: UserCheck, path: '/staff' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'students', label: 'Students', icon: GraduationCap, path: '/students' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ],

  GENERAL_MANAGER: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/leads' },
    { id: 'staff', label: 'Staff', icon: UserCheck, path: '/staff' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  ],

  ADMISSION_MANAGER: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'My Leads', icon: Users, path: '/leads' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  ],

  ADMISSION_EXECUTIVE: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'My Leads', icon: Users, path: '/leads' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
  ],

  BDM: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/leads' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  ],

  TRAINER: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'students', label: 'My Students', icon: GraduationCap, path: '/students' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
  ],

  HR: [
    { id: 'overview', label: 'Overview', icon: FileText, path: '/' },
    { id: 'staff', label: 'Staff', icon: UserCheck, path: '/staff' },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, path: '/tasks' },
  ],
};

// Get menu items for a role
export const getMenuForRole = (role) => {
  return roleNavigation[role] || roleNavigation.ADMISSION_EXECUTIVE; 
};