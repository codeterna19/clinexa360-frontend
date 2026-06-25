import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Users, Calendar, CreditCard, Clock, Bell, ChevronDown } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import UserDropdown from '../components/UserDropdown';

export default function ClinicAdminLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/clinic-admin', icon: LayoutDashboard },
    { name: 'Doctors', path: '/clinic-admin/doctors', icon: Stethoscope },
    { name: 'Staff', path: '/clinic-admin/staff', icon: Users },
    { name: 'Patients', path: '/clinic-admin/patients', icon: Users },
    { name: 'Shifts', path: '/clinic-admin/shifts', icon: Clock },
    { name: 'Appointments', path: '/clinic-admin/appointments', icon: Calendar },
    { name: 'Billing & Invoices', path: '/clinic-admin/billing', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-page font-sans text-text-primary">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border-light flex flex-col z-20">
        <div className="p-6 h-[88px] flex items-center border-b border-border-light">
          <h1 className="text-2xl font-bold text-primary-600">Clinexa360</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/clinic-admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-primary bg-primary-light/30 font-medium' : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-[3px] h-10 bg-primary rounded-full" />
                )}
                <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-light text-center text-xs text-gray-400 font-medium">
          v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[88px] bg-white border-b border-border-light flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">
            {navItems.find(i => location.pathname === i.path || (i.path !== '/clinic-admin' && location.pathname.startsWith(i.path)))?.name || user?.clinic_id?.name || 'Clinic Portal'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
            </button>
            <button className="h-10 px-4 rounded-full border border-border-light bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hidden md:block">
              Review Usage
            </button>
            <button className="h-10 px-4 rounded-full border border-border-light bg-white text-sm font-medium text-gray-700 flex items-center space-x-2 hover:bg-gray-50 transition-colors hidden md:flex">
              <Calendar size={16} className="text-gray-400" />
              <span>Today</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            <div className="h-8 w-px bg-border-light mx-2 hidden sm:block"></div>
            <UserDropdown user={user} handleLogout={handleLogout} roleName="Clinic Admin" />
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-auto p-8 bg-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
