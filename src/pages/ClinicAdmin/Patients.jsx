import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, User, Phone, Mail, Edit, Trash2 } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form State
  const initialFormState = {
    name: '', email: '', phone: '', password: 'Patient@123',
    gender: 'Male', dob: '', blood_group: '', emergency_contact: '',
    allergies: '', medical_history: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState({ ...initialFormState, _id: '' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/patients');
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const data = isEdit ? editFormData : formData;
    const setData = isEdit ? setEditFormData : setFormData;
    
    // For arrays, split by comma
    if (e.target.name === 'allergies' || e.target.name === 'medical_history') {
      const arrValue = e.target.value.split(',').map(s => s.trim()).filter(s => s);
      setData({ ...data, [e.target.name]: arrValue, [`_${e.target.name}Input`]: e.target.value });
    } else {
      setData({ ...data, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (typeof payload.allergies === 'string') payload.allergies = [];
      if (typeof payload.medical_history === 'string') payload.medical_history = [];
      
      await api.post('/patients', payload);
      setShowModal(false);
      setFormData(initialFormState);
      fetchPatients();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding patient');
    }
  };

  const handleEditClick = (patient) => {
    setEditFormData({
      ...patient,
      password: '',
      _allergiesInput: patient.allergies?.join(', ') || '',
      _medical_historyInput: patient.medical_history?.join(', ') || '',
      dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password;
      delete payload._allergiesInput;
      delete payload._medical_historyInput;

      await api.put(`/patients/${payload._id}`, payload);
      setShowEditModal(false);
      fetchPatients();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating patient');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting patient');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-500">Manage all registered patients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Patient
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info (Gender/DOB)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No patients found</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                          {patient.name?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-2 text-gray-400" /> {patient.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={14} className="mr-2 text-gray-400" /> {patient.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{patient.gender}</div>
                      <div>{new Date(patient.dob).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {patient.blood_group || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(patient)}
                          className="px-3 py-1 rounded-md transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(patient._id)}
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

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Add Patient</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required value={formData.name} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" required value={formData.email} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="text" name="phone" required value={formData.phone} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" value={formData.gender} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" name="dob" required value={formData.dob} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Blood Group</label><input type="text" name="blood_group" value={formData.blood_group} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g. O+" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Emergency Contact</label><input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Allergies (comma separated)</label><input type="text" name="allergies" value={formData._allergiesInput || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Medical History (comma separated)</label><textarea name="medical_history" rows="2" value={formData._medical_historyInput || ''} onChange={(e) => handleInputChange(e, false)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                </div>
                <div className="mt-6 border-t pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Add Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Edit Patient</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required value={editFormData.name} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" required value={editFormData.email} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="text" name="phone" required value={editFormData.phone} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">New Password (optional)</label><input type="password" name="password" value={editFormData.password} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" value={editFormData.gender} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" name="dob" required value={editFormData.dob} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Blood Group</label><input type="text" name="blood_group" value={editFormData.blood_group} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Emergency Contact</label><input type="text" name="emergency_contact" value={editFormData.emergency_contact} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Allergies (comma separated)</label><input type="text" name="allergies" value={editFormData._allergiesInput || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                  <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Medical History (comma separated)</label><textarea name="medical_history" rows="2" value={editFormData._medical_historyInput || ''} onChange={(e) => handleInputChange(e, true)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                </div>
                <div className="mt-6 border-t pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
