import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/SuperAdmin/Dashboard';
import Clinics from './pages/SuperAdmin/Clinics';
import Features from './pages/SuperAdmin/Features';
import Plans from './pages/SuperAdmin/Plans';
import Subscriptions from './pages/SuperAdmin/Subscriptions';
import Settings from './pages/SuperAdmin/Settings';
import ClinicAdminLayout from './layouts/ClinicAdminLayout';
import ClinicAdminDashboard from './pages/ClinicAdmin/ClinicAdminDashboard';
import Doctors from './pages/ClinicAdmin/Doctors';
import Staff from './pages/ClinicAdmin/Staff';
import Patients from './pages/ClinicAdmin/Patients';
import Appointments from './pages/ClinicAdmin/Appointments';
import Billing from './pages/ClinicAdmin/Billing';
import ClinicAdminSettings from './pages/ClinicAdmin/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/superadmin" 
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin']}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clinics" element={<Clinics />} />
          <Route path="features" element={<Features />} />
          <Route path="plans" element={<Plans />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route 
          path="/clinic-admin" 
          element={
            <ProtectedRoute allowedRoles={['ClinicAdmin', 'Receptionist', 'Doctor']}>
              <ClinicAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClinicAdminDashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<ClinicAdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
