import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, User, Phone, Mail, MoreVertical, Briefcase, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

const DAYS = [
  { label: 'Mo', full: 'Monday' },
  { label: 'Tu', full: 'Tuesday' },
  { label: 'We', full: 'Wednesday' },
  { label: 'Th', full: 'Thursday' },
  { label: 'Fr', full: 'Friday' },
  { label: 'Sa', full: 'Saturday' },
  { label: 'Su', full: 'Sunday' }
];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    qualification: '', specialization: '', registration_number: '', consultation_fee: '', 
    available_timings: [{ days: ['Monday'], start: '09:00', end: '17:00' }]
  });

  const [editFormData, setEditFormData] = useState({
    _id: '', name: '', email: '', phone: '', password: '',
    qualification: '', specialization: '', registration_number: '', consultation_fee: '', 
    available_timings: []
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/clinic-admin/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimingChange = (index, field, value, isEdit = false) => {
    const data = isEdit ? editFormData : formData;
    const newTimings = [...data.available_timings];
    if (field === 'day') {
      const daysArray = newTimings[index].days || [];
      if (daysArray.includes(value)) {
        newTimings[index].days = daysArray.filter(d => d !== value);
      } else {
        newTimings[index].days = [...daysArray, value];
      }
    } else {
      newTimings[index][field] = value;
    }
    
    if (isEdit) {
      setEditFormData({ ...data, available_timings: newTimings });
    } else {
      setFormData({ ...data, available_timings: newTimings });
    }
  };

  const addTimingSlot = (isEdit = false) => {
    if (isEdit) {
      setEditFormData({ 
        ...editFormData, 
        available_timings: [...editFormData.available_timings, { days: ['Monday'], start: '09:00', end: '17:00' }] 
      });
    } else {
      setFormData({ 
        ...formData, 
        available_timings: [...formData.available_timings, { days: ['Monday'], start: '09:00', end: '17:00' }] 
      });
    }
  };

  const removeTimingSlot = (index, isEdit = false) => {
    if (isEdit) {
      const newTimings = editFormData.available_timings.filter((_, i) => i !== index);
      setEditFormData({ ...editFormData, available_timings: newTimings });
    } else {
      const newTimings = formData.available_timings.filter((_, i) => i !== index);
      setFormData({ ...formData, available_timings: newTimings });
    }
  };

  const handleEditClick = (doc) => {
    setEditFormData({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      password: '',
      qualification: doc.qualification,
      specialization: doc.specialization,
      registration_number: doc.registration_number,
      consultation_fee: doc.consultation_fee,
      available_timings: doc.available_timings && doc.available_timings.length > 0 
        ? doc.available_timings 
        : [{ days: ['Monday'], start: '09:00', end: '17:00' }]
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password;
      await api.put(`/clinic-admin/doctors/${editFormData._id}`, payload);
      setShowEditModal(false);
      fetchDoctors();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating doctor');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/clinic-admin/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting doctor');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clinic-admin/doctors', formData);
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', password: '',
        qualification: '', specialization: '', registration_number: '', consultation_fee: '', 
        available_timings: [{ days: ['Monday'], start: '09:00', end: '17:00' }]
      });
      fetchDoctors();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating doctor');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500">Manage doctors in your clinic</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Doctor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No doctors found</td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <User size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Dr. {doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.qualification}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-2 text-gray-400" /> {doc.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={14} className="mr-2 text-gray-400" /> {doc.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Briefcase size={14} className="mr-2 text-gray-400" /> {doc.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{doc.consultation_fee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(doc)}
                          className="px-3 py-1 rounded-md transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(doc._id)}
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

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Add New Doctor</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <div className="relative mt-1">
                        <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Specialization</label><input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Qualification</label><input type="text" name="qualification" required value={formData.qualification} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Registration Number</label><input type="text" name="registration_number" required value={formData.registration_number} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label><input type="number" name="consultation_fee" required value={formData.consultation_fee} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Available Timings</label>
                        <button type="button" onClick={addTimingSlot} className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                          <Plus size={14} className="mr-1" /> Add Slot
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.available_timings.map((slot, index) => (
                          <div key={index} className="flex flex-col space-y-2 p-3 border border-gray-100 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                {DAYS.map(d => {
                                  const isSelected = slot.days && slot.days.includes(d.full);
                                  return (
                                    <button
                                      key={d.full}
                                      type="button"
                                      onClick={() => handleTimingChange(index, 'day', d.full, false)}
                                      className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                                        isSelected 
                                          ? 'bg-primary-600 text-white shadow-md' 
                                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                      }`}
                                      title={d.full}
                                    >
                                      {d.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {formData.available_timings.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeTimingSlot(index, false)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors font-bold"
                                  title="Remove slot"
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input 
                                type="time" 
                                value={slot.start} 
                                onChange={(e) => handleTimingChange(index, 'start', e.target.value, false)}
                                className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                              <span className="text-gray-500 text-sm font-medium">to</span>
                              <input 
                                type="time" 
                                value={slot.end} 
                                onChange={(e) => handleTimingChange(index, 'end', e.target.value, false)}
                                className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t rounded-b-xl">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Add Doctor
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

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Doctor</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" required value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="text" name="phone" required value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative mt-1">
                        <input type={showEditPassword ? "text" : "password"} name="password" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                          {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Specialization</label><input type="text" name="specialization" required value={editFormData.specialization} onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Qualification</label><input type="text" name="qualification" required value={editFormData.qualification} onChange={(e) => setEditFormData({...editFormData, qualification: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Registration Number</label><input type="text" name="registration_number" required value={editFormData.registration_number} onChange={(e) => setEditFormData({...editFormData, registration_number: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label><input type="number" name="consultation_fee" required value={editFormData.consultation_fee} onChange={(e) => setEditFormData({...editFormData, consultation_fee: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Available Timings</label>
                        <button type="button" onClick={() => addTimingSlot(true)} className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                          <Plus size={14} className="mr-1" /> Add Slot
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editFormData.available_timings.map((slot, index) => (
                          <div key={index} className="flex flex-col space-y-2 p-3 border border-gray-100 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                {DAYS.map(d => {
                                  const isSelected = slot.days && slot.days.includes(d.full);
                                  return (
                                    <button
                                      key={d.full}
                                      type="button"
                                      onClick={() => handleTimingChange(index, 'day', d.full, true)}
                                      className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                                        isSelected 
                                          ? 'bg-primary-600 text-white shadow-md' 
                                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                      }`}
                                      title={d.full}
                                    >
                                      {d.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {editFormData.available_timings.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeTimingSlot(index, true)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors font-bold"
                                  title="Remove slot"
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input 
                                type="time" 
                                value={slot.start} 
                                onChange={(e) => handleTimingChange(index, 'start', e.target.value, true)}
                                className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                              <span className="text-gray-500 text-sm font-medium">to</span>
                              <input 
                                type="time" 
                                value={slot.end} 
                                onChange={(e) => handleTimingChange(index, 'end', e.target.value, true)}
                                className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        ))}
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
