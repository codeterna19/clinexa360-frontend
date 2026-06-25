import { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../api/axios';
import { Mail, Phone, Building2, Shield, User as UserIcon, Save } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [clinicData, setClinicData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loadingClinic, setLoadingClinic] = useState(false);
  const [savingClinic, setSavingClinic] = useState(false);
  const [successClinic, setSuccessClinic] = useState('');

  useEffect(() => {
    if (user?.role === 'ClinicAdmin') {
      fetchClinicSettings();
    }
  }, [user]);

  const fetchClinicSettings = async () => {
    try {
      setLoadingClinic(true);
      const { data } = await api.get('/clinic-admin/settings');
      if (data) {
        setClinicData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingClinic(false);
    }
  };

  const handleClinicSubmit = async (e) => {
    e.preventDefault();
    setSavingClinic(true);
    setSuccessClinic('');
    try {
      const { data } = await api.put('/clinic-admin/settings', clinicData);
      setClinicData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      });
      setSuccessClinic('Clinic settings updated successfully!');
      setTimeout(() => setSuccessClinic(''), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating settings');
    } finally {
      setSavingClinic(false);
    }
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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

      {/* Clinic Settings Section (Only for ClinicAdmin) */}
      {user.role === 'ClinicAdmin' && (
        <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden animate-in fade-in duration-200">
          <div className="p-8 border-b border-border-light">
            <h3 className="text-lg font-bold text-text-primary flex items-center">
              <Building2 className="mr-2 text-primary" size={20} />
              Clinic Settings
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Update clinic profile and public information.
            </p>
          </div>

          {successClinic && (
            <div className="mx-8 mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <p className="text-sm text-green-700">{successClinic}</p>
            </div>
          )}

          {loadingClinic ? (
            <div className="p-8 text-center text-text-secondary">Loading clinic settings...</div>
          ) : (
            <form onSubmit={handleClinicSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-text-secondary font-semibold block mb-1.5 uppercase tracking-wider">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={clinicData.name}
                    onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-semibold block mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={clinicData.email}
                    onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-semibold block mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={clinicData.phone}
                    onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-text-secondary font-semibold block mb-1.5 uppercase tracking-wider">
                    Physical Address
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={clinicData.address}
                    onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-light">
                <button
                  type="submit"
                  disabled={savingClinic}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-600 focus:outline-none transition-all shadow-primary cursor-pointer disabled:opacity-50 font-semibold text-sm"
                >
                  <Save size={16} className="mr-2" />
                  {savingClinic ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
