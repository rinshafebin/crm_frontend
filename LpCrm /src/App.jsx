import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Pages/Login.jsx';
import DashboardOverview from './Pages/DashboardOverview.jsx';
import LeadsPage from './Pages/LeadsPage.jsx';
import StaffPage from './Pages/StaffPage.jsx';
import TasksPage from './Pages/TasksPage.jsx';
import ReportsPage from './Pages/ReportsPage.jsx';
import StudentsPage from './Pages/StudentsPage.jsx';
import SettingsPage from './Pages/SettingsPage.jsx';
import NotificationsPage from './Pages/NotificationsPage.jsx';
import AddLeadPage from './Pages/AddLeadPage.jsx';
import AddStaffPage from './Pages/AddStaffPage.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/addnewlead" element={<AddLeadPage />} />
        <Route path="/staff/add" element={< AddStaffPage />} />

      </Routes>
    </Router>
  );
}