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
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/staff/tasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/daily/reports" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ],

  BUSINESS_HEAD: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" }, // own tasks
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" }, // own reports
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ],

  OPS: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  // ADM_MANAGER: Overview, leads, own tasks, own reports
  ADM_MANAGER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  // ADM_EXEC: Same as ADM_MANAGER
  ADM_EXEC: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  // MEDIA: Overview, own tasks, own reports
  MEDIA: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  // TRAINER: Overview, own students, own tasks, own reports
  TRAINER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  BDM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "reports", label: "Reports", icon: FileText, path: "/myreports" },
  ],

  CM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
  ],

  HR: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
  ],

  FOE: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
  ],
};

export const getMenuForRole = (role) => {
  if (!role) return [];
  return roleNavigation[role.toUpperCase()] || [];
};
