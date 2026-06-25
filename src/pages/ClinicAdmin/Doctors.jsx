import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, User, Phone, Mail, Briefcase, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500">Manage doctors in your clinic</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(doc._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Doctor Details' : 'Add New Doctor'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <form id="doctor-form" onSubmit={handleSubmit}>
                
                {/* Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 hidden md:grid">
                  <div className="border-b pb-2"><h4 className="font-semibold text-gray-700">Basic Information</h4></div>
                  <div className="border-b pb-2"><h4 className="font-semibold text-gray-700">Professional Details</h4></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Row 1 */}
                  <div>
                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 md:hidden">Basic Information</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 md:hidden">Professional Details</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select name="specialization" required value={formData.specialization} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white transition-shadow">
                      <option value="">Select Specialization...</option>
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" placeholder="doctor@clinic.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <select name="qualification" required value={formData.qualification} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white transition-shadow">
                      <option value="">Select Qualification...</option>
                      {QUALIFICATIONS.map(qual => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" required pattern="[0-9+\s\-]+" minLength="10" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" placeholder="+1 234 567 8900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input type="text" name="registration_number" required value={formData.registration_number} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" placeholder="e.g. MED123456" />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        required={!editingId} 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10 transition-shadow" 
                        placeholder={editingId ? "Leave blank to keep unchanged" : "Secure password"}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                    <input type="number" name="consultation_fee" required min="0" step="50" value={formData.consultation_fee} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" placeholder="500" />
                  </div>

                </div>

                  {/* Available Timings Widget */}
                  <div className="col-span-2 mt-4 border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-700">Available Timings</h4>
                      <button 
                        type="button" 
                        onClick={handleAddSlot} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center border border-blue-600 rounded-lg px-4 py-1.5 transition-colors hover:bg-blue-50"
                      >
                        <Plus size={16} className="mr-1" /> Add Slot
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.available_timings.map((slot, index) => (
                        <div key={index} className="relative bg-white p-5 rounded-xl border border-gray-200 flex flex-col space-y-4">
                          {formData.available_timings.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSlot(index)} 
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Slot"
                            >
                              <X size={20} />
                            </button>
                          )}
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-3">Select Days</p>
                            <div className="flex flex-wrap gap-3">
                              {DAYS_OF_WEEK.map(day => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleDay(index, day)}
                                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-all border ${
                                    (slot.days || []).includes(day) 
                                      ? 'bg-blue-600 border-blue-600 text-white' 
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-3">Select Time</p>
                            <div className="flex items-center space-x-3 w-full">
                              <TimeSelect 
                                value={slot.start} 
                                onChange={val => handleTimingChange(index, 'start', val)}
                              />
                              <span className="text-gray-400 font-medium">to</span>
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

              </form>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="doctor-form"
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Add Doctor'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
