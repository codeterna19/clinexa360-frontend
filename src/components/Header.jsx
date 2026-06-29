import { useState, useEffect } from 'react';
import { Bell, Calendar, Clock } from 'lucide-react';
import UserDropdown from './UserDropdown';

export default function Header({ title, user, handleLogout, roleName }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-[88px] bg-white border-b border-border-light flex items-center justify-between px-8 z-10 shrink-0">
      <h2 className="text-xl font-semibold text-text-primary">
        {title}
      </h2>
      
      <div className="flex items-center space-x-4">
        {/* Clock & Date */}
        <div className="hidden md:flex items-center space-x-4 bg-gray-50 border border-gray-100 rounded-full px-4 h-10 shadow-sm">
          <div className="flex items-center space-x-1.5 text-gray-600 font-medium text-sm">
            <Calendar size={16} className="text-primary" />
            <span>{formattedDate}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1.5 text-gray-600 font-medium text-sm">
            <Clock size={16} className="text-primary" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-border-light mx-2 hidden sm:block"></div>
        
        <UserDropdown user={user} handleLogout={handleLogout} roleName={roleName} />
      </div>
    </header>
  );
}
