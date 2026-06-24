import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Building, MapPin, Phone, Mail, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    adminPassword: '',
    subscriptionPlan: ''
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinicsRes, plansRes] = await Promise.all([
        api.get('/clinics'),
        api.get('/plans')
      ]);
      setClinics(clinicsRes.data);
      setPlans(plansRes.data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error fetching data:', error);
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
        adminName: '', adminEmail: '', adminPhone: '', adminPassword: '', subscriptionPlan: ''
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating clinic');
    }
  };

  const handleEditClick = async (clinic) => {
    try {
      const { data: adminData } = await api.get(`/clinics/${clinic._id}/admin`);
      setEditFormData({
        _id: clinic._id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        adminName: adminData.name,
        adminEmail: adminData.email,
        adminPhone: adminData.phone,
        adminPassword: '' // Blank, user can type new password if they want
      });
      setShowEditModal(true);
    } catch (error) {
      alert('Error fetching admin details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clinics/${editFormData._id}`, {
        name: editFormData.name,
        address: editFormData.address,
        phone: editFormData.phone,
        email: editFormData.email
      });

      const adminPayload = {
        adminName: editFormData.adminName,
        adminEmail: editFormData.adminEmail,
        adminPhone: editFormData.adminPhone,
      };
      if (editFormData.adminPassword) {
        adminPayload.adminPassword = editFormData.adminPassword;
      }
      
      await api.put(`/clinics/${editFormData._id}/admin`, adminPayload);

      setShowEditModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating clinic');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/clinics/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic and all its users? This action cannot be undone.')) {
      try {
        await api.delete(`/clinics/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting clinic');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinics Management</h1>
          <p className="text-gray-500">Manage all registered clinics in the system</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Clinic
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No clinics found</td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          <Building size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin size={14} className="mr-1" /> {clinic.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-2 text-gray-400" /> {clinic.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={14} className="mr-2 text-gray-400" /> {clinic.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-1 ${
                        clinic.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Plan: {clinic.subscriptionPlan?.name || 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(clinic.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(clinic)}
                          className="px-3 py-1 rounded-md transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(clinic._id, clinic.status)}
                          className={`px-3 py-1 rounded-md transition-colors flex items-center ${
                            clinic.status === 'Active' 
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {clinic.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(clinic._id)}
                          className="px-3 py-1 rounded-md transition-colors bg-red-50 text-red-600 hover:bg-red-100 flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </div>
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
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Register New Clinic</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2"><h4 className="font-semibold text-gray-700 border-b pb-2">Clinic Information</h4></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                      <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Email</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                      <select name="subscriptionPlan" value={formData.subscriptionPlan} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="">Select a Plan</option>
                        {plans.map(plan => (
                          <option key={plan._id} value={plan._id}>{plan.name} (₹{plan.price})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 mt-4"><h4 className="font-semibold text-gray-700 border-b pb-2">Clinic Administrator Details</h4></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                      <input type="text" name="adminName" required value={formData.adminName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                      <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Phone</label>
                      <input type="text" name="adminPhone" required value={formData.adminPhone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                      <div className="relative mt-1">
                        <input type={showPassword ? "text" : "password"} name="adminPassword" required value={formData.adminPassword} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t rounded-b-xl">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Register Clinic
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Clinic</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2"><h4 className="font-semibold text-gray-700 border-b pb-2">Clinic Information</h4></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                      <input type="text" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input type="text" required value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                      <input type="text" required value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic Email</label>
                      <input type="email" required value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>

                    <div className="col-span-2 mt-4"><h4 className="font-semibold text-gray-700 border-b pb-2">Clinic Administrator Details</h4></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                      <input type="text" required value={editFormData.adminName} onChange={(e) => setEditFormData({...editFormData, adminName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                      <input type="email" required value={editFormData.adminEmail} onChange={(e) => setEditFormData({...editFormData, adminEmail: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Phone</label>
                      <input type="text" required value={editFormData.adminPhone} onChange={(e) => setEditFormData({...editFormData, adminPhone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password <span className="font-normal text-gray-400">(optional)</span></label>
                      <div className="relative mt-1">
                        <input type={showEditPassword ? "text" : "password"} value={editFormData.adminPassword} onChange={(e) => setEditFormData({...editFormData, adminPassword: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                          {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t rounded-b-xl">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
