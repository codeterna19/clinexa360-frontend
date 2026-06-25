import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Receipt, X } from 'lucide-react';
import api from '../../api/axios';

export default function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => getKolkataDate(new Date()));
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'selected', 'upcoming', 'previous'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: '',
    time: '10:00',
    type: 'Consultation',
    status: 'Pending',
    description: ''
  });

  const [quickPatientData, setQuickPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    dob: ''
  });

  // Helper to get date in Asia/Kolkata timezone
  function getKolkataDate(dateInput = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
      const parts = formatter.formatToParts(dateInput);
      const map = {};
      parts.forEach(p => {
        map[p.type] = p.value;
      });
      return new Date(parseInt(map.year), parseInt(map.month) - 1, parseInt(map.day), 0, 0, 0, 0);
    } catch (e) {
      const d = new Date(dateInput);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchDoctorsAndPatients();
  }, []);

  useEffect(() => {
    if (location.state?.openBookModal) {
      handleOpenModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndPatients = async () => {
    try {
      const resPatients = await api.get('/patients');
      setPatients(resPatients.data);

      let doctorsData = [];
      try {
        const res = await api.get('/doctors');
        doctorsData = res.data;
      } catch (err) {
        try {
          const res = await api.get('/users?role=Doctor');
          doctorsData = res.data;
        } catch (err2) {
          try {
            const res = await api.get('/clinic-admin/doctors');
            doctorsData = res.data;
          } catch (err3) {
            console.error('Failed to fetch doctors from all endpoints:', err3);
          }
        }
      }
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors/patients:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'No Show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Timezone-safe date equality check
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Timezone-safe DB date parser (pinned to Asia/Kolkata timezone)
  const parseDbDate = (dateStr) => {
    if (!dateStr) return null;
    return getKolkataDate(new Date(dateStr));
  };

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Count appointments for a specific day
  const getAppointmentCountForDate = (day) => {
    if (!day) return 0;
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return appointments.filter(apt => {
      if (!apt.date) return false;
      const aptDate = parseDbDate(apt.date);
      return isSameDay(aptDate, dateToCheck);
    }).length;
  };

  const handleDateClick = (day) => {
    if (day) {
      const newD = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(newD);
      const todayDate = getKolkataDate(new Date());
      if (isSameDay(newD, todayDate)) {
        setActiveTab('today');
      } else {
        setActiveTab('selected');
      }
    }
  };

  const handleOpenModal = (apt = null, defaultPatientId = '') => {
    if (apt) {
      setEditingId(apt._id);

      // Format date to YYYY-MM-DD timezone-safely
      let formattedDate = '';
      if (apt.date) {
        const d = new Date(apt.date);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }

      setFormData({
        patient_id: apt.patient_id?._id || apt.patient_id || '',
        doctor_id: apt.doctor_id?._id || apt.doctor_id || '',
        date: formattedDate,
        time: apt.time || '10:00',
        type: apt.type || 'Consultation',
        status: apt.status || 'Pending',
        description: apt.description || ''
      });
    } else {
      setEditingId(null);

      // Default date to currently selected calendar date
      const d = selectedDate;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setFormData({
        patient_id: defaultPatientId,
        doctor_id: '',
        date: formattedDate,
        time: '10:00',
        type: 'Consultation',
        status: 'Pending',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const aptToUpdate = appointments.find(a => a._id === id);
      const payload = {
        patient_id: aptToUpdate.patient_id?._id || aptToUpdate.patient_id,
        doctor_id: aptToUpdate.doctor_id?._id || aptToUpdate.doctor_id,
        date: aptToUpdate.date,
        time: aptToUpdate.time,
        type: aptToUpdate.type,
        status: newStatus,
        description: aptToUpdate.description
      };
      await api.put(`/appointments/${id}`, payload);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.date || !formData.time) {
      alert("Please fill all fields");
      return;
    }
    if (formData.type === 'Direct' && !formData.description.trim()) {
      alert("Description/Reason is required for Direct Appointments");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      setIsModalOpen(false);
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting appointment');
      }
    }
  };

  const handleCollectPayment = (apt) => {
    navigate('/clinic-admin/billing', { 
      state: { 
        prefillPatientId: apt.patient_id?._id || apt.patient_id,
        prefillAptId: apt._id,
        prefillDoctorId: apt.doctor_id?._id || apt.doctor_id,
        prefillAmount: 500 // default mock amount
      } 
    });
  };

  const handleQuickPatientSubmit = async (e) => {
    e.preventDefault();
    if (!quickPatientData.name || !quickPatientData.phone || !quickPatientData.email || !quickPatientData.gender || !quickPatientData.dob) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        ...quickPatientData,
        password: 'PatientPassword123!',
        status: 'Active'
      };
      const { data } = await api.post('/patients', payload);
      
      // Refresh patients list
      await fetchDoctorsAndPatients();
      
      // Reset
      setQuickPatientData({
        name: '',
        phone: '',
        email: '',
        gender: 'Male',
        dob: ''
      });
      setIsQuickAddOpen(false);

      // Open booking modal with new patient selected
      handleOpenModal(null, data._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering patient');
    }
  };

  // Setup tab filter timestamps (pinned to Asia/Kolkata timezone)
  const todayDate = getKolkataDate(new Date());

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  // Filter lists based on tab selection
  const filteredAppointments = appointments.filter(apt => {
    if (!apt.date) return false;
    const aptDate = parseDbDate(apt.date);
    if (!aptDate) return false;

    if (activeTab === 'today') {
      return isSameDay(aptDate, todayDate);
    } else if (activeTab === 'selected') {
      return isSameDay(aptDate, selectedDate);
    } else if (activeTab === 'upcoming') {
      return aptDate >= tomorrowDate;
    } else if (activeTab === 'previous') {
      return aptDate < todayDate;
    }
    return false;
  });

  // Calculate dynamic tab counts
  const countToday = appointments.filter(apt => apt.date && isSameDay(parseDbDate(apt.date), todayDate)).length;
  const countSelected = appointments.filter(apt => apt.date && isSameDay(parseDbDate(apt.date), selectedDate)).length;
  const countUpcoming = appointments.filter(apt => apt.date && parseDbDate(apt.date) >= tomorrowDate).length;
  const countPrevious = appointments.filter(apt => apt.date && parseDbDate(apt.date) < todayDate).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-text-secondary mt-1">Manage all clinic consultations and bookings</p>
        </div>
        <div className="flex space-x-3">
          <button 
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="bg-white border border-border-light text-text-primary h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-subtle cursor-pointer"
          >
            <Plus size={20} />
            <span>Quick Add Patient</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-white h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-primary-600 transition-all shadow-primary cursor-pointer"
          >
            <Plus size={20} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Calendar Side panel */}
        <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="text-primary" size={20} />
              <h3 className="font-semibold text-lg text-text-primary">Calendar</h3>
            </div>
          </div>
          
          <div className="mb-4 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded shadow-sm text-gray-600"><ChevronLeft size={20}/></button>
            <span className="font-medium text-gray-800">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded shadow-sm text-gray-600"><ChevronRight size={20}/></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const count = getAppointmentCountForDate(day);
              const isSelected = day && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
              
              return (
                <div key={idx} className="aspect-square p-1">
                  {day && (
                    <button
                      onClick={() => handleDateClick(day)}
                      className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all relative cursor-pointer ${
                        isSelected ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium z-10">{day}</span>
                      {count > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-primary'}`}></span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-border-light">
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Has Appointments</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span>
              <span>Selected Date</span>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-[20px] shadow-subtle border border-border-light overflow-x-hidden flex flex-col h-[600px]">
          {/* Tabs Header */}
          <div className="flex border-b border-border-light bg-slate-50/50">
            <button
              onClick={() => {
                setActiveTab('today');
                setSelectedDate(todayDate);
              }}
              className={`flex-1 py-3.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'today'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100/50'
              }`}
            >
              <span>Today</span>
              <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${activeTab === 'today' ? 'bg-primary-light text-primary' : 'bg-gray-200 text-gray-600'}`}>{countToday}</span>
            </button>

            {!isSameDay(selectedDate, todayDate) && (
              <button
                onClick={() => setActiveTab('selected')}
                className={`flex-1 py-3.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeTab === 'selected'
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100/50'
                }`}
              >
                <span>Selected ({selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${activeTab === 'selected' ? 'bg-primary-light text-primary' : 'bg-gray-200 text-gray-600'}`}>{countSelected}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100/50'
              }`}
            >
              <span>Upcoming</span>
              <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${activeTab === 'upcoming' ? 'bg-primary-light text-primary' : 'bg-gray-200 text-gray-600'}`}>{countUpcoming}</span>
            </button>

            <button
              onClick={() => setActiveTab('previous')}
              className={`flex-1 py-3.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'previous'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100/50'
              }`}
            >
              <span>Previous</span>
              <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${activeTab === 'previous' ? 'bg-primary-light text-primary' : 'bg-gray-200 text-gray-600'}`}>{countPrevious}</span>
            </button>
          </div>
          
          <div className="divide-y divide-border-light overflow-y-auto flex-1">
            {loading ? (
              <div className="p-10 text-center text-text-secondary">Loading schedule...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center text-text-secondary">
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p className="font-medium">
                  {activeTab === 'today' && "No appointments scheduled for today."}
                  {activeTab === 'selected' && "No appointments scheduled for this date."}
                  {activeTab === 'upcoming' && "No upcoming appointments scheduled."}
                  {activeTab === 'previous' && "No past appointments found."}
                </p>
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div key={apt._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
                      {apt.patient_id?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">{apt.patient_id?.name || 'Unknown Patient'}</h4>
                      <div className="flex items-center space-x-4 mt-1.5 text-sm text-text-secondary flex-wrap gap-y-2">
                        <span className="flex items-center space-x-1.5 bg-gray-50 px-2 py-0.5 rounded-md"><User size={14} className="text-gray-400"/> <span className="font-medium text-text-primary">Dr. {apt.doctor_id?.name || 'Unknown'}</span></span>
                        <span className="flex items-center space-x-1.5 bg-gray-50 px-2 py-0.5 rounded-md"><Clock size={14} className="text-gray-400"/> <span className="font-medium text-text-primary">{apt.time}</span></span>
                        {activeTab !== 'today' && activeTab !== 'selected' && (
                          <span className="flex items-center space-x-1.5 bg-gray-50 px-2 py-0.5 rounded-md"><CalendarIcon size={14} className="text-gray-400"/> <span className="font-medium text-text-primary">{parseDbDate(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></span>
                        )}
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-semibold">{apt.type}</span>
                      </div>
                      {apt.description && (
                        <p className="text-xs text-text-secondary italic mt-2 bg-slate-50 border border-border-light rounded px-2 py-1 inline-block">
                          Note: {apt.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(apt.status)} border cursor-pointer outline-none appearance-none shadow-sm transition-all`}
                      style={{ textAlignLast: 'center' }}
                      title="Update Status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status === 'Completed' && (
                        <button 
                          onClick={() => handleCollectPayment(apt)} 
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                          title="Generate Invoice / Collect Payment"
                        >
                          <Receipt size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenModal(apt)} 
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer"
                        title="Edit Appointment"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(apt._id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete Appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Book/Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Appointment Details' : 'Book New Appointment'}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Patient *</label>
                  <button 
                    type="button" 
                    onClick={() => setIsQuickAddOpen(true)} 
                    className="text-xs font-bold text-primary hover:underline flex items-center"
                  >
                    <Plus size={12} className="mr-0.5" /> Quick Add
                  </button>
                </div>
                <select 
                  required
                  value={formData.patient_id} 
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone || p.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Doctor *</label>
                <select 
                  required
                  value={formData.doctor_id} 
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time *</label>
                  <input 
                    type="time" 
                    required
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type *</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Telemedicine">Telemedicine</option>
                    <option value="Direct">Direct Appointment</option>
                  </select>
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status *</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description / Reason {formData.type === 'Direct' && '*'}
                </label>
                <textarea 
                  required={formData.type === 'Direct'}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder={formData.type === 'Direct' ? "Reason for direct appointment (required)..." : "Reason for visit or clinical notes..."}
                  rows="3"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white resize-none text-sm font-medium"
                />
              </div>

              <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4.5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm cursor-pointer shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Patient Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Quick Add Patient</h3>
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); setIsQuickAddOpen(false); }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickPatientSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Patient Name"
                  value={quickPatientData.name} 
                  onChange={e => setQuickPatientData({...quickPatientData, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Mobile number"
                    value={quickPatientData.phone} 
                    onChange={e => setQuickPatientData({...quickPatientData, phone: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Email address"
                    value={quickPatientData.email} 
                    onChange={e => setQuickPatientData({...quickPatientData, email: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender *</label>
                  <select 
                    value={quickPatientData.gender} 
                    onChange={e => setQuickPatientData({...quickPatientData, gender: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer text-sm font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">DOB *</label>
                  <input 
                    type="date" 
                    required
                    value={quickPatientData.dob} 
                    onChange={e => setQuickPatientData({...quickPatientData, dob: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium" 
                  />
                </div>
              </div>
              <div className="bg-gray-50 -mx-5 -mb-5 px-5 py-3.5 border-t border-gray-100 flex justify-end space-x-2 mt-4">
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setIsQuickAddOpen(false); }}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-xs bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-xs cursor-pointer"
                >
                  Add & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
