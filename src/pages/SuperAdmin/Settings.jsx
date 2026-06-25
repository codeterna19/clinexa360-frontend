import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfileData(prev => ({
        ...prev,
        name: data.name,
        email: data.email
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        name: profileData.name,
        email: profileData.email
      };
      
      if (profileData.password) {
        updatePayload.password = profileData.password;
      }

      await api.put('/users/profile', updatePayload);
      alert('Profile updated successfully!');
      
      // Clear password fields
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 flex justify-center py-10">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary mt-1">Manage your profile and security preferences</p>
      </div>

      <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          {/* Profile Section */}
          <div className="p-8 border-b border-border-light">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-light text-primary rounded-xl mr-4">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Personal Information</h2>
                <p className="text-sm text-text-secondary">Update your name and email address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary ml-1 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={profileData.name} 
                  onChange={handleInputChange} 
                  className="w-full h-11 border border-border-light rounded-full shadow-sm px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary ml-1 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={profileData.email} 
                  onChange={handleInputChange} 
                  className="w-full h-11 border border-border-light rounded-full shadow-sm px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-primary" 
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Security</h2>
                <p className="text-sm text-text-secondary">Change your password (leave blank to keep current)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary ml-1 mb-1.5">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={profileData.password} 
                    onChange={handleInputChange} 
                    placeholder="••••••••"
                    className="w-full h-11 border border-border-light rounded-full shadow-sm pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-primary" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary ml-1 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={profileData.confirmPassword} 
                    onChange={handleInputChange} 
                    placeholder="••••••••"
                    className="w-full h-11 border border-border-light rounded-full shadow-sm pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-text-primary" 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-5 border-t border-border-light flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center px-6 py-2.5 h-11 bg-primary text-white font-bold rounded-full hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 cursor-pointer shadow-primary"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
