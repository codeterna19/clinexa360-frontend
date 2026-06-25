import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Plus, Building, MapPin, Phone, Mail, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Clinics() {
  const { user } = useContext(AuthContext);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: ''
  });

  const [editFormData, setEditFormData] = useState({
    _id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: ''
  });
  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const { data } = await api.get('/clinics');
      setClinics(data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clinics', formData);
      setShowModal(false);
      setFormData({
        name: '', address: '', phone: '', email: '',
        adminName: '', adminEmail: '', adminPhone: '', adminPassword: ''
      });
      fetchClinics();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating clinic');
    }
  };

  const handleEditClick = (clinic) => {
    setEditFormData({
      _id: clinic._id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      adminName: clinic.adminName || clinic.admin?.name || '',
      adminEmail: clinic.adminEmail || clinic.admin?.email || '',
      adminPhone: clinic.adminPhone || clinic.admin?.phone || '',
      adminPassword: ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editFormData.name,
        address: editFormData.address,
        phone: editFormData.phone,
        email: editFormData.email,
        adminName: editFormData.adminName,
        adminEmail: editFormData.adminEmail,
        adminPhone: editFormData.adminPhone
      };
      if (editFormData.adminPassword) {
        payload.adminPassword = editFormData.adminPassword;
      }
      await api.put(`/clinics/${editFormData._id}`, payload);
      setShowEditModal(false);
      fetchClinics();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating clinic');
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/clinics/${id}/status`, { status: newStatus });
      fetchClinics();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteClinic = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      try {
        await api.delete(`/clinics/${id}`);
        fetchClinics();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting clinic');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clinics Management</h1>
          <p className="text-text-secondary mt-1">Manage all registered clinics in the system</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-primary-600 transition-all shadow-primary cursor-pointer"
        >
          <Plus size={20} className="mr-1" />
          <span>Add New Clinic</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-text-secondary">Loading...</div>
      ) : (
        <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-border-light text-slate-500 text-xs font-semibold tracking-wide uppercase bg-slate-50/50">
                <th className="p-4">Clinic Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-text-secondary">No clinics found</td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic._id} className="h-[72px] hover:bg-slate-50 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-light rounded-full flex items-center justify-center text-primary">
                          <Building size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-text-primary">{clinic.name}</div>
                          <div className="text-xs text-text-secondary flex items-center mt-0.5">
                            <MapPin size={12} className="mr-1 opacity-70" /> {clinic.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary flex items-center">
                        <Mail size={14} className="mr-2 text-text-secondary" /> {clinic.email}
                      </div>
                      <div className="text-xs text-text-secondary flex items-center mt-1">
                        <Phone size={14} className="mr-2 opacity-70" /> {clinic.phone}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xxs font-bold rounded-full border ${
                        clinic.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-text-secondary font-medium">
                      {new Date(clinic.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                      <button 
                        onClick={() => handleEditClick(clinic)}
                        className="px-3 py-1.5 rounded-full transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(clinic._id, clinic.status)}
                        className={`px-3 py-1.5 rounded-full transition-colors text-xs font-semibold cursor-pointer ${
                          clinic.status === 'Active' 
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {clinic.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      {['SuperAdmin', 'Admin'].includes(user?.role) && (
                        <button 
                          onClick={() => handleDeleteClinic(clinic._id)}
                          className="px-3 py-1.5 rounded-full transition-colors bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Clinic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-[20px] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-text-primary">Register New Clinic</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2"><h4 className="font-bold text-text-primary border-b border-border-light pb-2">Clinic Information</h4></div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Address</label>
                      <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Phone</label>
                      <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Email</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>

                    <div className="col-span-2 mt-4"><h4 className="font-bold text-text-primary border-b border-border-light pb-2">Clinic Administrator Details</h4></div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Name</label>
                      <input type="text" name="adminName" required value={formData.adminName} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Email</label>
                      <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Phone</label>
                      <input type="text" name="adminPhone" required value={formData.adminPhone} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Password</label>
                      <div className="relative mt-1.5">
                        <input type={showAddPassword ? "text" : "password"} name="adminPassword" required value={formData.adminPassword} onChange={handleInputChange} className="h-11 block w-full pl-4 pr-10 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                        <button type="button" onClick={() => setShowAddPassword(!showAddPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer">
                          {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t border-border-light -mx-6 -mb-6">
                  <button type="submit" className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2.5 bg-primary font-bold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    Register Clinic
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-full border border-border-light shadow-sm px-6 py-2.5 bg-white font-bold text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Clinic Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-[20px] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-text-primary">Edit Clinic</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2"><h4 className="font-bold text-text-primary border-b border-border-light pb-2">Clinic Information</h4></div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Name</label>
                      <input type="text" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Address</label>
                      <input type="text" required value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Phone</label>
                      <input type="text" required value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic Email</label>
                      <input type="email" required value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>

                    <div className="col-span-2 mt-4"><h4 className="font-bold text-text-primary border-b border-border-light pb-2">Clinic Administrator Details</h4></div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Name</label>
                      <input type="text" required value={editFormData.adminName} onChange={(e) => setEditFormData({...editFormData, adminName: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Email</label>
                      <input type="email" required value={editFormData.adminEmail} onChange={(e) => setEditFormData({...editFormData, adminEmail: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Phone</label>
                      <input type="text" required value={editFormData.adminPhone} onChange={(e) => setEditFormData({...editFormData, adminPhone: e.target.value})} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Admin Password (Leave blank to keep unchanged)</label>
                      <div className="relative mt-1.5">
                        <input type={showEditPassword ? "text" : "password"} value={editFormData.adminPassword} onChange={(e) => setEditFormData({...editFormData, adminPassword: e.target.value})} className="h-11 block w-full pl-4 pr-10 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer">
                          {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t border-border-light -mx-6 -mb-6">
                  <button type="submit" className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2.5 bg-primary font-bold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="mt-3 w-full inline-flex justify-center rounded-full border border-border-light shadow-sm px-6 py-2.5 bg-white font-bold text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
