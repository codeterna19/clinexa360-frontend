import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, User, Phone, Mail, Briefcase, Edit2, Trash2, Eye, EyeOff, X, ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react';

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
  'Neurologist', 'Orthopedist', 'Psychiatrist', 'Gynecologist', 'Dentist'
];

const QUALIFICATIONS = [
  'MBBS', 'MD', 'DO', 'MS', 'BDS', 'MDS', 'PhD', 'DHMS'
];

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const TimeSelect = ({ value, onChange }) => {
  const [hour, minute] = value ? value.split(':') : ['10', '00'];
  let h = parseInt(hour || '10', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const strH = h.toString().padStart(2, '0');
  
  const handleTimeChange = (newH, newM, newAmpm) => {
    let finalH = parseInt(newH, 10);
    if (newAmpm === 'PM' && finalH !== 12) finalH += 12;
    if (newAmpm === 'AM' && finalH === 12) finalH = 0;
    onChange(`${finalH.toString().padStart(2, '0')}:${newM}`);
  };

  return (
    <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1.5 bg-white focus-within:ring-2 focus-within:ring-primary-500">
       <select value={strH} onChange={e => handleTimeChange(e.target.value, minute, ampm)} className="p-1 outline-none bg-transparent font-medium text-gray-700 cursor-pointer">
         {Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, '0')).map(hr => <option key={hr} value={hr}>{hr}</option>)}
       </select>
       <span className="text-gray-400 font-bold">:</span>
       <select value={minute} onChange={e => handleTimeChange(strH, e.target.value, ampm)} className="p-1 outline-none bg-transparent font-medium text-gray-700 cursor-pointer">
         {['00', '10', '15', '20', '30', '40', '45', '50'].map(m => <option key={m} value={m}>{m}</option>)}
       </select>
       <select value={ampm} onChange={e => handleTimeChange(strH, minute, e.target.value)} className="p-1 outline-none bg-gray-100 rounded text-sm font-semibold text-gray-700 cursor-pointer ml-1">
         <option value="AM">AM</option>
         <option value="PM">PM</option>
       </select>
    </div>
  );
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState('basic'); // 'basic', 'professional', 'timings'

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    qualification: '', specialization: '', registration_number: '', consultation_fee: '', 
    available_timings: [
      { days: [], start: '10:00', end: '18:00' }
    ]
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

  const handleOpenModal = (doc = null) => {
    setModalTab('basic');
    if (doc) {
      setEditingId(doc._id);
      
      let timings = doc.available_timings;
      if (typeof timings === 'string') {
          timings = [{ days: [], start: '10:00', end: '18:00' }];
      } else if (!Array.isArray(timings) || timings.length === 0) {
          timings = [{ days: [], start: '10:00', end: '18:00' }];
      } else {
          // Standardize database schema fields (days, start, end)
          timings = timings.map(slot => ({
            days: slot.days || [],
            start: slot.start || slot.start_time || '10:00',
            end: slot.end || slot.end_time || '18:00'
          }));
      }

      setFormData({
        name: doc.name || '', email: doc.email || '', phone: doc.phone || '', password: '',
        qualification: doc.qualification || '', specialization: doc.specialization || '', 
        registration_number: doc.registration_number || '', consultation_fee: doc.consultation_fee || '', 
        available_timings: timings
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', phone: '', password: '',
        qualification: '', specialization: '', registration_number: '', consultation_fee: '', 
        available_timings: [{ days: [], start_time: '10:00', end_time: '18:00' }]
      });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  // Timings Handlers
  const handleAddSlot = () => {
    setFormData(prev => ({
      ...prev,
      available_timings: [...prev.available_timings, { days: [], start: '10:00', end: '18:00' }]
    }));
  };

  const handleRemoveSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      available_timings: prev.available_timings.filter((_, i) => i !== index)
    }));
  };

  const handleTimingChange = (index, field, value) => {
    setFormData(prev => {
      const newTimings = [...prev.available_timings];
      newTimings[index] = { ...newTimings[index], [field]: value };
      return { ...prev, available_timings: newTimings };
    });
  };

  const toggleDay = (slotIndex, day) => {
    setFormData(prev => {
      const newTimings = [...prev.available_timings];
      // Create a deep copy of the slot and its days array
      const slot = { ...newTimings[slotIndex], days: [...(newTimings[slotIndex].days || [])] };
      
      if (slot.days.includes(day)) {
        slot.days = slot.days.filter(d => d !== day);
      } else {
        slot.days = [...slot.days, day];
      }
      
      newTimings[slotIndex] = slot;
      return { ...prev, available_timings: newTimings };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out slots that have no days selected, as user mentioned no days = closed
    const validTimings = formData.available_timings.filter(slot => slot.days.length > 0);

    for (let slot of validTimings) {
      if (!slot.start || !slot.end) {
        alert("Please select start and end times for all active slots.");
        return;
      }
    }

    try {
      if (editingId) {
        const updateData = { ...formData, available_timings: validTimings };
        if (!updateData.password) delete updateData.password;
        await api.put(`/clinic-admin/doctors/${editingId}`, updateData);
      } else {
        await api.post('/clinic-admin/doctors', { ...formData, available_timings: validTimings });
      }
      setShowModal(false);
      fetchDoctors();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving doctor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await api.delete(`/clinic-admin/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting doctor');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctors</h1>
          <p className="text-text-secondary mt-1">Manage doctors in your clinic</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-primary-600 transition-all shadow-primary cursor-pointer"
        >
          <Plus size={20} className="mr-1" />
          <span>Add New Doctor</span>
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
                  <th className="p-4 font-semibold">Doctor Details</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Specialization</th>
                  <th className="p-4 font-semibold">Fee</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-text-secondary">No doctors found</td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr key={doc._id} className="h-[72px] hover:bg-slate-50 transition-colors group">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary">Dr. {doc.name}</div>
                            <div className="text-xs text-text-secondary mt-0.5">{doc.qualification}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 text-sm">
                          <span className="flex items-center text-text-secondary"><Mail size={12} className="text-gray-400 mr-1.5" /> {doc.email}</span>
                          <span className="flex items-center text-text-secondary"><Phone size={12} className="text-gray-400 mr-1.5" /> {doc.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-text-secondary">
                        <div className="flex items-center">
                          <Briefcase size={12} className="text-gray-400 mr-1.5" /> {doc.specialization}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                        ₹{doc.consultation_fee}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right text-sm font-medium space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(doc)} className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors cursor-pointer">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer">
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

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? 'Edit Doctor Details' : 'Add New Doctor'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingId ? 'Modify doctor profile, qualification, and timings' : 'Create a new doctor file for shift assignments'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  modalTab === 'basic'
                    ? 'border-primary-600 text-primary-600 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <User size={16} />
                <span>1. Basic Info</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.phone || (!editingId && !formData.password)) {
                    alert("Please fill all required fields in the Basic Info tab first.");
                    return;
                  }
                  setModalTab('professional');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  modalTab === 'professional'
                    ? 'border-primary-600 text-primary-600 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <Briefcase size={16} />
                <span>2. Professional Info</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.phone || (!editingId && !formData.password)) {
                    alert("Please fill all required fields in the Basic Info tab first.");
                    return;
                  }
                  if (!formData.specialization || !formData.qualification || !formData.registration_number || !formData.consultation_fee) {
                    alert("Please fill all required fields in the Professional Info tab first.");
                    return;
                  }
                  setModalTab('timings');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  modalTab === 'timings'
                    ? 'border-primary-600 text-primary-600 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <Clock size={16} />
                <span>3. Work Hours</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-white">
                
                {modalTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            name="name"
                            required
                            placeholder="John Doe"
                            value={formData.name} 
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            pattern="[0-9+\s\-]+" 
                            minLength="10"
                            placeholder="+91 98765 43210"
                            value={formData.phone} 
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="doctor@clinic.com"
                            value={formData.email} 
                            onChange={handleInputChange}
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
                            type={showPassword ? "text" : "password"} 
                            name="password"
                            required={!editingId}
                            placeholder={editingId ? 'Leave blank to keep unchanged' : 'Secure password'}
                            value={formData.password} 
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-800 text-sm font-medium" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'professional' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Specialization *</label>
                        <select 
                          name="specialization"
                          required
                          value={formData.specialization} 
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer text-sm font-medium text-gray-800"
                        >
                          <option value="">Select Specialization...</option>
                          {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Qualification *</label>
                        <select 
                          name="qualification"
                          required
                          value={formData.qualification} 
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer text-sm font-medium text-gray-800"
                        >
                          <option value="">Select Qualification...</option>
                          {QUALIFICATIONS.map(qual => (
                            <option key={qual} value={qual}>{qual}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Registration Number *</label>
                        <input 
                          type="text" 
                          name="registration_number"
                          required
                          placeholder="e.g. MED123456"
                          value={formData.registration_number} 
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium text-gray-800" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Consultation Fee (₹) *</label>
                        <input 
                          type="number" 
                          name="consultation_fee"
                          required
                          min="0"
                          step="50"
                          placeholder="500"
                          value={formData.consultation_fee} 
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium text-gray-800" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'timings' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-gray-700 text-sm">Doctor Shift Timings</h4>
                      <button 
                        type="button" 
                        onClick={handleAddSlot} 
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center border border-blue-600 rounded-lg px-3 py-1 transition-colors hover:bg-blue-50 cursor-pointer"
                      >
                        <Plus size={14} className="mr-0.5" /> Add Slot
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                      {formData.available_timings.map((slot, index) => (
                        <div key={index} className="relative bg-slate-50 p-4 rounded-xl border border-gray-100 flex flex-col space-y-3">
                          {formData.available_timings.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSlot(index)} 
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Remove Slot"
                            >
                              <X size={18} />
                            </button>
                          )}
                          
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Days</p>
                            <div className="flex flex-wrap gap-2">
                              {DAYS_OF_WEEK.map(day => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleDay(index, day)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all border cursor-pointer ${
                                    (slot.days || []).includes(day) 
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Time</p>
                            <div className="flex items-center space-x-2.5 w-full">
                              <TimeSelect 
                                value={slot.start} 
                                onChange={val => handleTimingChange(index, 'start', val)}
                              />
                              <span className="text-gray-400 font-medium text-xs">to</span>
                              <TimeSelect 
                                value={slot.end} 
                                onChange={val => handleTimingChange(index, 'end', val)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer with Tab-Specific Controls */}
              <div className="bg-gray-50 px-6 py-4.5 border-t border-gray-100 flex justify-between items-center shrink-0">
                {modalTab === 'basic' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!formData.name || !formData.email || !formData.phone || (!editingId && !formData.password)) {
                          alert("Please fill all required fields in the Basic Info tab.");
                          return;
                        }
                        setModalTab('professional');
                      }}
                      className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm cursor-pointer shadow-sm flex items-center space-x-1.5"
                    >
                      <span>Professional Info</span>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {modalTab === 'professional' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setModalTab('basic')}
                      className="px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white flex items-center space-x-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>Basic Info</span>
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!formData.specialization || !formData.qualification || !formData.registration_number || !formData.consultation_fee) {
                          alert("Please fill all required fields in the Professional Info tab.");
                          return;
                        }
                        setModalTab('timings');
                      }}
                      className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm cursor-pointer shadow-sm flex items-center space-x-1.5"
                    >
                      <span>Work Hours</span>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {modalTab === 'timings' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setModalTab('professional')}
                      className="px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white flex items-center space-x-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>Professional Info</span>
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm cursor-pointer shadow-sm"
                    >
                      {editingId ? 'Save Changes' : 'Register Doctor'}
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
