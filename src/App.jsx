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
import Shifts from './pages/ClinicAdmin/Shifts';
import Appointments from './pages/ClinicAdmin/Appointments';
import Billing from './pages/ClinicAdmin/Billing';
import ClinicSettings from './pages/ClinicAdmin/ClinicSettings';

import ReceptionistLayout from './layouts/ReceptionistLayout';
import ReceptionistDashboard from './pages/Receptionist/ReceptionistDashboard';
import PatientRegistration from './pages/Receptionist/PatientRegistration';

import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import PatientEMR from './pages/Doctor/PatientEMR';

import NurseLayout from './layouts/NurseLayout';
import NurseDashboard from './pages/Nurse/NurseDashboard';

import LabAssistantLayout from './layouts/LabAssistantLayout';
import LabAssistantDashboard from './pages/LabAssistant/LabAssistantDashboard';

import AccountantLayout from './layouts/AccountantLayout';
import AccountantDashboard from './pages/Accountant/AccountantDashboard';

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
            <ProtectedRoute allowedRoles={['ClinicAdmin']}>
              <ClinicAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClinicAdminDashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="patients" element={<Patients />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<ClinicSettings />} />
        </Route>

        <Route 
          path="/doctor" 
          element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="emr" element={<PatientEMR />} />
          <Route path="appointments" element={<div className="p-4 text-gray-500">Appointments Coming Soon</div>} />
          <Route path="lab-results" element={<div className="p-4 text-gray-500">Lab Results Coming Soon</div>} />
          <Route path="settings" element={<div className="p-4 text-gray-500">Settings Coming Soon</div>} />
        </Route>

        <Route 
          path="/receptionist" 
          element={
            <ProtectedRoute allowedRoles={['Receptionist']}>
              <ReceptionistLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<div className="p-4 text-gray-500">Appointments Coming Soon</div>} />
          <Route path="registration" element={<PatientRegistration />} />
          <Route path="billing" element={<div className="p-4 text-gray-500">Billing Coming Soon</div>} />
        </Route>

        <Route 
          path="/nurse" 
          element={
            <ProtectedRoute allowedRoles={['Nurse']}>
              <NurseLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NurseDashboard />} />
          <Route path="triage" element={<div className="p-4 text-gray-500">Triage Coming Soon</div>} />
          <Route path="patients" element={<div className="p-4 text-gray-500">Patients Coming Soon</div>} />
        </Route>

        <Route 
          path="/lab-assistant" 
          element={
            <ProtectedRoute allowedRoles={['LabAssistant']}>
              <LabAssistantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<LabAssistantDashboard />} />
          <Route path="requests" element={<div className="p-4 text-gray-500">Lab Requests Coming Soon</div>} />
          <Route path="results" element={<div className="p-4 text-gray-500">Lab Results Coming Soon</div>} />
        </Route>

        <Route 
          path="/accountant" 
          element={
            <ProtectedRoute allowedRoles={['Accountant']}>
              <AccountantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountantDashboard />} />
          <Route path="invoices" element={<div className="p-4 text-gray-500">Invoices Coming Soon</div>} />
          <Route path="payroll" element={<div className="p-4 text-gray-500">Payroll Coming Soon</div>} />
          <Route path="reports" element={<div className="p-4 text-gray-500">Reports Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
