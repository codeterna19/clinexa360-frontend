import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import api from '../../api/axios';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for new appointment
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Consultation'
  });

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/clinic-admin/doctors')
      ]);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/appointments?date=${selectedDate}`);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
      await api.post('/appointments', formData);
      setShowModal(false);
      fetchAppointments();
      setFormData({
        patient_id: '',
        doctor_id: '',
        date: selectedDate,
        time: '09:00',
        type: 'Consultation'
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating appointment');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all clinic consultations and bookings</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary/90 transition-colors"
        >
          <Plus size={20} />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Side panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-max">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="text-secondary" />
            <h3 className="font-semibold text-lg">Select Date</h3>
          </div>
          <div>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              Schedule for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <span className="bg-secondary/10 text-secondary text-sm font-medium px-3 py-1 rounded-full">
              {appointments.length} Appointments
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No appointments scheduled for this date</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      {apt.patient_id?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{apt.patient_id?.name || 'Unknown Patient'}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center space-x-1"><User size={14} /> <span>Dr. {apt.doctor_id?.name || 'Unknown'}</span></span>
                        <span className="flex items-center space-x-1"><Clock size={14} /> <span>{apt.time}</span></span>
                        <span className="text-gray-400">&bull; {apt.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                    <select
                      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 py-1 pl-2 pr-8 bg-white"
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">New Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Patient</label>
                  <select name="patient_id" required value={formData.patient_id} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
                  <select name="doctor_id" required value={formData.doctor_id} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>Dr. {d.name} - {d.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input type="time" name="time" required value={formData.time} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                  <select name="type" required value={formData.type} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div className="pt-4 border-t flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Book Appointment
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
