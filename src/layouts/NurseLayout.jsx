import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Users, LogOut } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function NurseLayout() {
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
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Nurse</div>
          <Link to="/nurse" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/nurse/triage" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <Activity size={20} />
            <span>Triage / Vitals</span>
          </Link>
          <Link to="/nurse/patients" className="relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary">
            <Users size={20} />
            <span>Patients</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border-light">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Account</div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 h-12 px-4 w-full rounded-xl hover:bg-red-50 text-text-secondary hover:text-danger transition-colors cursor-pointer"
          >
            <LogOut size={20} className="text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[88px] bg-white border-b border-border-light flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">{user?.clinic_id?.name || 'Clinic Portal'}</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-text-primary">{user?.name || 'Nurse'}</p>
                <p className="text-xs text-text-secondary">Nurse</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold uppercase border border-primary-200">
                {user?.name?.substring(0, 2) || 'NR'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
