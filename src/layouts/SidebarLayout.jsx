import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Settings, LogOut, List, CreditCard, Package } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function SidebarLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="flex h-screen bg-light">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-primary-500">Clinexa360</h1>
          <p className="text-sm text-gray-400 mt-1">Super Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/superadmin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/superadmin/clinics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Building2 size={20} />
            <span>Clinics</span>
          </Link>
          <Link to="/superadmin/features" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <List size={20} />
            <span>Features</span>
          </Link>
          <Link to="/superadmin/plans" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Package size={20} />
            <span>Plans</span>
          </Link>
          <Link to="/superadmin/subscriptions" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </Link>
          <Link to="/superadmin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name || 'Admin'}</h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
              {user?.name?.substring(0, 2) || 'SA'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
