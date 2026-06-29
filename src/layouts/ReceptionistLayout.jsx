import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, CreditCard, Settings } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import UserDropdown from '../components/UserDropdown';
import Header from '../components/Header';

export default function ReceptionistLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-page font-sans text-text-primary">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border-light flex flex-col z-20">
        <div className="p-6 h-[88px] flex items-center border-b border-border-light">
          <h1 className="text-2xl font-bold text-primary">Clinexa360</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Receptionist</div>
          <Link to="/receptionist" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/receptionist/patients" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <Users size={20} />
            <span>Patient Management</span>
          </Link>
          <Link to="/receptionist/appointments" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <Calendar size={20} />
            <span>Appointments</span>
          </Link>
          <Link to="/receptionist/billing" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <CreditCard size={20} />
            <span>Billing</span>
          </Link>
          <Link to="/receptionist/settings" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border-light text-center text-xs text-gray-400 font-medium">
          v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={user?.clinic_id?.name || 'Clinic Portal'} 
          user={user} 
          handleLogout={handleLogout} 
          roleName="Receptionist" 
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
