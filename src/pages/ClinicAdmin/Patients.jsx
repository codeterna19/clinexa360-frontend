import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, FileText, CheckCircle, X, ShieldAlert, Heart, Lock, Calendar, ClipboardList, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState('personal'); // 'personal', 'medical'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'Active',
    gender: 'Male',
    dob: '',
    blood_group: '',
    emergency_contact: '',
    allergies: '',
    medical_history: ''
  });

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

  const handleOpenModal = (patient = null) => {
    setModalTab('personal'); // Reset to personal tab on open
    if (patient) {
      setEditingId(patient._id);
      
      let formattedDob = '';
      if (patient.dob) {
        const d = new Date(patient.dob);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        formattedDob = `${year}-${month}-${day}`;
      }

      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        password: '',
        status: patient.status || 'Active',
        gender: patient.gender || 'Male',
        dob: formattedDob,
        blood_group: patient.blood_group || '',
        emergency_contact: patient.emergency_contact || '',
        allergies: patient.allergies ? patient.allergies.join(', ') : '',
        medical_history: patient.medical_history ? patient.medical_history.join(', ') : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'PatientPassword123!',
        status: 'Active',
        gender: 'Male',
        dob: '',
        blood_group: '',
        emergency_contact: '',
        allergies: '',
        medical_history: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.gender || !formData.dob) {
      alert("Please fill all required fields in the Personal Info tab.");
      setModalTab('personal');
      return;
    }

    const allergiesArray = formData.allergies
      ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const medicalHistoryArray = formData.medical_history
      ? formData.medical_history.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      gender: formData.gender,
      dob: formData.dob,
      blood_group: formData.blood_group,
      emergency_contact: formData.emergency_contact,
      allergies: allergiesArray,
      medical_history: medicalHistoryArray
    };

    if (!editingId || formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving patient details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient profile? This action is permanent and cannot be undone.")) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting patient');
      }
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '-';
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const activeCount = patients.filter(p => p.status === 'Active').length;
  const criticalCount = patients.filter(p => p.allergies && p.allergies.length > 0).length;

  const filteredPatients = patients.filter(p => {
    const name = p.name || '';
    const email = p.email || '';
    const phone = p.phone || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
           email.toLowerCase().includes(query) ||
           phone.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-500 mt-1">Add, update, and manage clinic patient profiles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm font-semibold cursor-pointer"
        >
          <Plus size={20} />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-primary-50 text-primary-600 p-3 rounded-lg"><User size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-500">Total Patients</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-500">Active Patients</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-lg"><ShieldAlert size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-500">Allergy/Critical Records</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-lg text-gray-900">Registered Patients</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone, email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-semibold tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Gender & Age</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">Loading patients database...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-gray-400">No patient records found</td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-md shadow-sm border border-primary-200">
                          {p.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <span className="text-xxs text-gray-400">ID: {p._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1 text-sm">
                        <span className="flex items-center text-gray-700 font-medium"><Phone size={12} className="text-gray-400 mr-1.5"/> {p.phone}</span>
                        <span className="flex items-center text-gray-500"><Mail size={12} className="text-gray-400 mr-1.5"/> {p.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {p.gender} ({calculateAge(p.dob)} yrs)
                    </td>
                    <td className="p-4">
                      {p.blood_group ? (
                        <span className="px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 font-semibold text-xs inline-flex items-center space-x-1">
                          <Heart size={12} className="fill-red-500 text-red-500" />
                          <span>{p.blood_group}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex border ${
                        p.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer inline-flex"
                        title="Edit Patient"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex"
                        title="Delete Patient"
                      >
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

      {/* Modern tabbed Patient Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? 'Edit Patient Profile' : 'Register New Patient'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingId ? 'Modify patient medical history and personal files' : 'Create a new medical file for diagnostic tracking'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(false);
                }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModalTab('personal');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  modalTab === 'personal'
                    ? 'border-primary-600 text-primary-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <User size={16} />
                <span>1. Personal Info</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (!formData.name || !formData.email || !formData.phone || !formData.gender || !formData.dob) {
                    alert("Please fill all required fields in the Personal Info tab before switching.");
                    return;
                  }
                  setModalTab('medical');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  modalTab === 'medical'
                    ? 'border-primary-600 text-primary-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <ClipboardList size={16} />
                <span>2. Medical History</span>
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              
              {/* Scrollable Form Body */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto bg-white">
                
                {modalTab === 'personal' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Row 1: Name and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            required
                            placeholder="John Doe"
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mobile Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email and Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="email" 
                            required
                            placeholder="john@example.com"
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {editingId ? 'New Password' : 'Password *'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="password" 
                            required={!editingId}
                            placeholder={editingId ? '••••••••' : 'PatientPassword123!'}
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: DOB and Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="date" 
                            required
                            value={formData.dob} 
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Account Status</label>
                        <div className="flex gap-2 mt-0.5">
                          {['Active', 'Inactive'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormData({...formData, status: s})}
                              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                                formData.status === s
                                  ? s === 'Active'
                                    ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                                    : 'border-gray-500 bg-gray-50 text-gray-700 shadow-sm'
                                  : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Gender selector chips */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Gender *</label>
                      <div className="flex gap-3">
                        {['Male', 'Female', 'Other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({...formData, gender: g})}
                            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                              formData.gender === g
                                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm font-bold'
                                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'medical' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Row 1: Blood Group and Emergency Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Blood Group</label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <select 
                            value={formData.blood_group} 
                            onChange={e => setFormData({...formData, blood_group: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer text-sm font-medium"
                          >
                            <option value="">Select Group...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Emergency Contact</label>
                        <div className="relative">
                          <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Name & Relationship / Number"
                            value={formData.emergency_contact} 
                            onChange={e => setFormData({...formData, emergency_contact: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Allergies */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Allergies (comma-separated)</label>
                      <div className="relative">
                        <ShieldAlert className="absolute left-3 top-3.5 text-gray-400" size={16} />
                        <textarea 
                          placeholder="e.g. Peanuts, Penicillin, Dust, Latex"
                          value={formData.allergies} 
                          onChange={e => setFormData({...formData, allergies: e.target.value})}
                          rows="2"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium resize-none" 
                        />
                      </div>
                    </div>

                    {/* Row 3: Medical History */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Medical History (comma-separated)</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3.5 text-gray-400" size={16} />
                        <textarea 
                          placeholder="e.g. Hypertension, Diabetes, Asthma, Heart disease"
                          value={formData.medical_history} 
                          onChange={e => setFormData({...formData, medical_history: e.target.value})}
                          rows="3"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium resize-none" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with Tab-Specific Controls */}
              <div className="bg-gray-50 px-6 py-4.5 border-t border-gray-100 flex justify-between items-center">
                {modalTab === 'personal' ? (
                  <>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsModalOpen(false);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!formData.name || !formData.email || !formData.phone || !formData.gender || !formData.dob) {
                          alert("Please fill all required fields in the Personal Info tab.");
                          return;
                        }
                        setModalTab('medical');
                      }}
                      className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm cursor-pointer shadow-sm flex items-center space-x-1.5"
                    >
                      <span>Medical Info</span>
                      <ChevronRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setModalTab('personal');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white flex items-center space-x-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>Personal Info</span>
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm cursor-pointer shadow-sm"
                    >
                      {editingId ? 'Save Changes' : 'Register Patient'}
                    </button>
                  </>
                )}
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
