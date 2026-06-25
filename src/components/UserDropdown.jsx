import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDropdown({ user, handleLogout, roleName }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use a slight delay for mouse leave to avoid flickering
  let timeoutId;
  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setIsOpen(false), 200);
  };

  // Determine the base path for the profile link based on role
  const rolePathMap = {
    SuperAdmin: '/superadmin',
    ClinicAdmin: '/clinic-admin',
    Doctor: '/doctor',
    Receptionist: '/receptionist',
    Nurse: '/nurse',
    LabAssistant: '/lab-assistant',
    Accountant: '/accountant'
  };
  const basePath = user?.role ? rolePathMap[user.role] : '';

  return (
    <div className="relative z-50" ref={dropdownRef} onMouseLeave={handleMouseLeave}>
      {/* Trigger */}
      <div 
        className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-text-primary">{user?.name || roleName}</p>
          <p className="text-xs font-medium text-text-secondary">{roleName}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold uppercase border border-primary-200 shadow-sm">
          {user?.name?.substring(0, 2) || roleName.substring(0, 2)}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-14 w-[280px] bg-white rounded-xl shadow-lg border border-border-light overflow-hidden transition-all duration-200 transform origin-top-right"
          onMouseEnter={handleMouseEnter}
        >
          {/* Header Profile Section */}
          <div className="p-4 border-b border-border-light flex items-center space-x-4 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-lg uppercase shrink-0 border border-primary-200">
              {user?.name?.substring(0, 2) || roleName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-text-primary truncate">{user?.name || roleName}</p>
              <p className="text-xs font-medium text-text-secondary truncate">{user?.email || 'admin@clinexa360.com'}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-2">
            <Link 
              to={`${basePath}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <User size={18} />
              <span>Show Profile</span>
            </Link>
          </div>
          
          {/* Sign Out */}
          <div className="p-2 border-t border-border-light bg-slate-50/30">
            <button 
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-bold text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
