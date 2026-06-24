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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile and security preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit}>
          
          {/* Profile Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500">Update your name and email address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={profileData.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={profileData.email} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" 
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Change your password (leave blank to keep current)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    value={profileData.password} 
                    onChange={handleInputChange} 
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" 
                    value={profileData.confirmPassword} 
                    onChange={handleInputChange} 
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-5 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
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
