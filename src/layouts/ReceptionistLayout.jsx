import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserPlus, CreditCard, LogOut } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function ReceptionistLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-light">
      <aside className="w-64 bg-dark text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-secondary">Clinexa360</h1>
          <p className="text-sm text-gray-400 mt-1">Receptionist Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/receptionist" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/receptionist/appointments" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Calendar size={20} />
            <span>Appointments</span>
          </Link>
          <Link to="/receptionist/registration" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <UserPlus size={20} />
            <span>Patient Registration</span>
          </Link>
          <Link to="/receptionist/billing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <CreditCard size={20} />
            <span>Billing</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">{user?.clinic_id?.name || 'Clinic'}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold uppercase">
              {user?.name?.substring(0, 2) || 'RC'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
