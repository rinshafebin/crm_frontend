import {
  Users,
  UserCheck,
  ListTodo,
  FileText,
  GraduationCap,
  CalendarCheck,
  ShieldAlert,
  FolderClock,
  PhoneCall,
} from "lucide-react";

export const roleNavigation = {
  ADMIN: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/staff/tasks" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    {
      id: "staffReports",
      label: "Staff Reports",
      icon: FileText,
      path: "/daily/reports",
    },
  ],

  BUSINESS_HEAD: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    {
      id: "voxbay",
      label: "Call Dashboard",
      icon: PhoneCall,
      external: true,
      path: "https://x.voxbay.com/admin/dashboard",
    },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  OPS: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  ADM_MANAGER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    {
      id: "voxbay",
      label: "Call Dashboard",
      icon: PhoneCall,
      external: true,
      path: "https://x.voxbay.com/admin/dashboard",
    },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  ADM_EXEC: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    {
      id: "voxbay",
      label: "Call Dashboard",
      icon: PhoneCall,
      external: true,
      path: "https://x.voxbay.com/admin/dashboard",
    },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  MEDIA: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  TRAINER: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "students", label: "Students", icon: GraduationCap, path: "/students" },
    {
      id: "markAttendance",
      label: "Mark Attendance",
      icon: CalendarCheck,
      path: "/attendance/mark",
    },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  BDM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  CM: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
    {
      id: "staffReports",
      label: "Staff Reports",
      icon: FileText,
      path: "/daily/reports",
    },
  ],

  HR: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "staff", label: "Staff", icon: UserCheck, path: "/staff" },
    {
      id: "penalties",
      label: "Penalties",
      icon: ShieldAlert,
      path: "/hr/penalties",
    },
    {
      id: "attendanceDocs",
      label: "Attendance Docs",
      icon: FolderClock,
      path: "/hr/attendance",
    },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  FOE: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
  ],

  ACCOUNTS: [
    { id: "overview", label: "Overview", icon: FileText, path: "/" },
    {
      id: "penalties",
      label: "Penalties",
      icon: ShieldAlert,
      path: "/hr/penalties",
    },
    { id: "myReports", label: "My Reports", icon: FileText, path: "/myreports" },
    { id: "tasks", label: "Tasks", icon: ListTodo, path: "/mytasks" },
  ],
};

export const getMenuForRole = (role) => {
  if (!role) return [];
  return roleNavigation[role.toUpperCase()] || [];
};
