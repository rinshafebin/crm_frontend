// src/config/roles.js
import {
  Users,
  UserCheck,
  ListTodo,
  FileText,
  GraduationCap,
  Settings,
} from "lucide-react";


export const roleNavigation = {
  ADMIN: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ],

  BUSINESS_HEAD: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },

  ],

  OPS: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    {id : "leads", label: "Leads", icon: Users, path: "/leads" },
    {id : "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
  ],

  ADM_MANAGER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  ],

  ADM_EXEC: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "My Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
  ],

  PROCESSING: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },

  ],

  MEDIA: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  ],

  TRAINER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "students", label: "My Students", icon: GraduationCap, path: "/students" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
  ],

  BDM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  ],

  CM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
  ],

  HR: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/tasks" },
  ],

  FOE: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
  ],
};

export const getMenuForRole = (role) => {
  return roleNavigation[role] || [];
};
