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
import EditLeadPage from './Pages/EditLeadPage.jsx';
import EditStaffPage from './Pages/EditStaffPage.jsx';
import TaskCreationForm from "./Pages/TaskCreationForm.jsx";
import TaskViewPage from "./Pages/TaskViewPage.jsx";
import EditTaskPage from "./Pages/EditTaskPage.jsx";
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import ReportViewPage from "./Pages/ReportViewPage.jsx";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; 

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/leads/edit/:id" element={<ProtectedRoute><EditLeadPage /></ProtectedRoute>} />
        <Route path="/addnewlead" element={<ProtectedRoute><AddLeadPage /></ProtectedRoute>} />

        <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/staff/create" element={<ProtectedRoute><AddStaffPage /></ProtectedRoute>} />
        <Route path="/staff/edit/:id" element={<ProtectedRoute><EditStaffPage /></ProtectedRoute>} />

        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/tasks/new" element={<ProtectedRoute><TaskCreationForm /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskViewPage /></ProtectedRoute>} />
        <Route path="/tasks/edit/:id" element={<ProtectedRoute><EditTaskPage /></ProtectedRoute>} />

        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/reports/view/:id" element={<ProtectedRoute><ReportViewPage /></ProtectedRoute>} />



        <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </Router>
  );
}
