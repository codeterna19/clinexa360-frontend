import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Calendar, Activity, Settings } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import UserDropdown from '../components/UserDropdown';
import Header from '../components/Header';
import { hasFeatureAccess } from '../utils/featureAccess';

export default function DoctorLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
    { name: 'Patient EMR', path: '/doctor/emr', icon: Stethoscope, feature: 'Patients' }, // Or EMR
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar, feature: 'Appointments' },
    { name: 'Lab Results', path: '/doctor/lab-results', icon: Activity, feature: 'Lab' },
    { name: 'Settings', path: '/doctor/settings', icon: Settings },
  ];

  const visibleNavItems = navItems.filter(item => !item.feature || hasFeatureAccess(user, item.feature));

  return (
    <div className="flex h-screen bg-page font-sans text-text-primary">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border-light flex flex-col z-20">
        <div className="p-6 h-[88px] flex items-center border-b border-border-light">
          <h1 className="text-2xl font-bold text-primary">Clinexa360</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Doctor Portal</div>
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/doctor' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`relative flex items-center space-x-3 h-12 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-primary bg-primary-light/30 font-medium' : 'text-text-secondary hover:bg-slate-50 focus:bg-primary-light/30 focus:text-primary'
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
        <Header 
          title={visibleNavItems.find(i => location.pathname === i.path || (i.path !== '/doctor' && location.pathname.startsWith(i.path)))?.name || user?.clinic_id?.name || 'Clinic'} 
          user={user} 
          handleLogout={handleLogout} 
          roleName="Doctor" 
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
