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
  CalendarClock
} from "lucide-react";

// Role-based navigation config
export const roleNavigation = {
  ADMIN: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "staff",      label: "Staff",       icon: UserCheck,     path: "/staff" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "students",   label: "Students",    icon: GraduationCap, path: "/students" },
    { id: "reports",    label: "Reports",     icon: FileText,      path: "/daily/reports" },
    { id: "call",       label: "Voxbay",      icon: PhoneCall,     path: "/call-analytics" },
  ],

  CEO: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "staff",      label: "Staff",       icon: UserCheck,     path: "/staff" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "students",   label: "Students",    icon: GraduationCap, path: "/students" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
    { id: "reports",    label: "Reports",     icon: FileText,      path: "/daily/reports" },
    { id: "call",       label: "Voxbay",      icon: PhoneCall,     path: "/call-analytics" },
  ],

  BUSINESS_HEAD: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "staff",      label: "Staff",       icon: UserCheck,     path: "/staff" },
    { id: "myTasks",    label: "My Tasks",    icon: ListTodo,      path: "/mytasks" },
    { id: "allTasks",   label: "All Tasks",   icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  OPS: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "staff",      label: "Staff",       icon: UserCheck,     path: "/staff" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  ADM_MANAGER: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  ADM_COUNSELLOR: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  ADM_EXEC: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  MEDIA: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  TRAINER: [
    { id: "overview",        label: "Overview",        icon: FileText,      path: "/" },
    { id: "students",        label: "Students",        icon: GraduationCap, path: "/students" },
    { id: "markAttendance",  label: "Mark Attendance", icon: CalendarCheck, path: "/attendance/mark" },
    { id: "tasks",           label: "Tasks",           icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",       label: "My Reports",      icon: FileText,      path: "/myreports" },
  ],

  BDM: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  CM: [
    { id: "overview",      label: "Overview",      icon: FileText,      path: "/" },
    { id: "staff",         label: "Staff",         icon: UserCheck,     path: "/staff" },
    { id: "leads",         label: "Leads",         icon: Users,         path: "/leads" },
    { id: "tasks",         label: "Tasks",         icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",     label: "My Reports",    icon: FileText,      path: "/myreports" },
    { id: "staffReports",  label: "Staff Reports", icon: FileText,      path: "/daily/reports" },
  ],

  HR: [
    { id: "overview",        label: "Overview",        icon: FileText,    path: "/" },
    { id: "staff",           label: "Staff",           icon: UserCheck,   path: "/staff" },
    { id: "penalties",       label: "Penalties",       icon: ShieldAlert, path: "/hr/penalties" },
    { id: "attendanceDocs",  label: "Attendance Docs", icon: FolderClock, path: "/hr/attendance" },
    { id: "candidates",      label: "Candidates",      icon: Users,       path: "/candidates" },
    { id: "tasks",           label: "Tasks",           icon: ListTodo,    path: "/staff/tasks" },
    { id: "myReports",       label: "My Reports",      icon: FileText,    path: "/myreports" },
  ],

  FOE: [
    { id: "overview",   label: "Overview",    icon: FileText,      path: "/" },
    { id: "leads",      label: "Leads",       icon: Users,         path: "/leads" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,      path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,      path: "/myreports" },
  ],

  DOCUMENTATION: [
    { id: "overview",   label: "Overview",    icon: FileText,  path: "/" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,  path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,  path: "/myreports" },
  ],

  ACCOUNTS: [
    { id: "overview",   label: "Overview",    icon: FileText,    path: "/" },
    { id: "penalties",  label: "Penalties",   icon: ShieldAlert, path: "/hr/penalties" },
    { id: "tasks",      label: "Tasks",       icon: ListTodo,    path: "/staff/tasks" },
    { id: "myReports",  label: "My Reports",  icon: FileText,    path: "/myreports" },
  ],
};

// Safe getter
export const getMenuForRole = (role) =>
  role ? roleNavigation[role.toUpperCase()] || [] : [];
