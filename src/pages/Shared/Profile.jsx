import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { Mail, Phone, Building2, Shield, User as UserIcon } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your personal information and settings</p>
      </div>

      <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-primary-100 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-3xl uppercase overflow-hidden">
              {user?.name?.substring(0, 2) || 'US'}
            </div>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="pt-16 pb-8 px-8 border-b border-border-light">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-text-secondary font-medium">{user.role}</span>
                {user.clinic_id && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-sm text-primary font-semibold flex items-center">
                      <Building2 size={14} className="mr-1" />
                      {user.clinic_id.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button className="px-6 py-2 bg-slate-100 text-text-secondary rounded-full font-semibold text-sm cursor-not-allowed opacity-50">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center">
              <UserIcon size={16} className="mr-2" /> Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-1">Full Name</label>
                <div className="bg-slate-50 border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary font-medium">
                  {user.name}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-1">Email Address</label>
                <div className="bg-slate-50 border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary font-medium flex items-center">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-1">Phone Number</label>
                <div className="bg-slate-50 border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary font-medium flex items-center">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  {user.phone || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center">
              <Shield size={16} className="mr-2" /> Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-1">Role & Permissions</label>
                <div className="bg-slate-50 border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary font-medium flex items-center">
                  <Shield size={16} className="text-primary mr-2" />
                  {user.role} Access Level
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium block mb-1">Password</label>
                <div className="flex space-x-2">
                  <div className="bg-slate-50 border border-border-light rounded-xl px-4 py-3 text-sm text-gray-400 font-medium flex-1 tracking-widest">
                    ••••••••
                  </div>
                  <button className="px-4 py-2 bg-white border border-border-light text-text-secondary rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
