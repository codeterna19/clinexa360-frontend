import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, User, Phone, Mail, BadgeInfo, Edit2, Trash2 } from 'lucide-react';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'Receptionist', shift_id: ''
  });

  const availableShifts = [
    { id: 1, name: 'Morning (08:00 - 16:00)' },
    { id: 2, name: 'Evening (16:00 - 00:00)' },
    { id: 3, name: 'Night (00:00 - 08:00)' },
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/clinic-admin/staff');
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingId(member._id);
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        password: '',
        role: member.role || 'Receptionist',
        shift_id: member.shift_id || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', phone: '', password: '', role: 'Receptionist', shift_id: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/clinic-admin/staff/${editingId}`, updateData);
      } else {
        await api.post('/clinic-admin/staff', formData);
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving staff');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/clinic-admin/staff/${id}`);
        fetchStaff();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting staff');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Staff Management</h1>
          <p className="text-text-secondary mt-1">Manage receptionists, nurses, and accountants</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-primary-600 transition-all shadow-primary cursor-pointer"
        >
          <Plus size={20} className="mr-1" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-text-secondary">Loading...</div>
      ) : (
        <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light text-slate-500 text-xs font-semibold tracking-wide uppercase bg-slate-50/50">
                  <th className="p-4 font-semibold">Staff Details</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-text-secondary">No staff found</td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member._id} className="h-[72px] hover:bg-slate-50 transition-colors group">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 text-sm">
                          <span className="flex items-center text-text-secondary"><Mail size={12} className="text-gray-400 mr-1.5" /> {member.email}</span>
                          <span className="flex items-center text-text-secondary"><Phone size={12} className="text-gray-400 mr-1.5" /> {member.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-text-secondary">
                        <div className="flex items-center">
                          <BadgeInfo size={12} className="text-gray-400 mr-1.5" /> {member.role}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xxs font-bold rounded-full border ${
                          member.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-right text-sm font-medium space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(member)} className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors cursor-pointer">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(member._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" name="password" required={!editingId} value={formData.password} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder={editingId ? "Leave blank to keep unchanged" : ""} /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select name="role" required value={formData.role} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="Receptionist">Receptionist</option>
                        <option value="Nurse">Nurse</option>
                        <option value="LabAssistant">Lab Assistant</option>
                        <option value="Accountant">Accountant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Shift</label>
                      <select name="shift_id" required value={formData.shift_id} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="">-- Select a Shift --</option>
                        {availableShifts.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t rounded-b-xl">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {editingId ? 'Save Changes' : 'Add Staff'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
