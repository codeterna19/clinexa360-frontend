import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
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
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    return appointments.filter(apt => new Date(apt.date).toDateString() === dateStr).length;
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
  };

  const filteredAppointments = appointments.filter(apt => new Date(apt.date).toDateString() === selectedDate.toDateString());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all clinic consultations and bookings</p>
        </div>
        <button className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary/90 transition-colors">
          <Plus size={20} />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Calendar Side panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="text-secondary" size={20} />
              <h3 className="font-semibold text-lg">Calendar</h3>
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
                      className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all relative ${
                        isSelected ? 'bg-secondary text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium z-10">{day}</span>
                      {count > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-primary-500'}`}></span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              <span>Has Appointments</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Selected Date</span>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-lg text-gray-800">
              Schedule for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <span className="bg-secondary/10 text-secondary text-sm font-semibold px-3 py-1 rounded-full">
              {filteredAppointments.length} Appointments
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading schedule...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p>No appointments scheduled for this date.</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div key={apt._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-lg shadow-sm border border-primary-200">
                      {apt.patient_id?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{apt.patient_id?.name || 'Unknown Patient'}</h4>
                      <div className="flex items-center space-x-4 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center space-x-1.5 bg-gray-100 px-2 py-0.5 rounded-md"><User size={14} className="text-gray-400"/> <span className="font-medium text-gray-700">Dr. {apt.doctor_id?.name || 'Unknown'}</span></span>
                        <span className="flex items-center space-x-1.5 bg-gray-100 px-2 py-0.5 rounded-md"><Clock size={14} className="text-gray-400"/> <span className="font-medium text-gray-700">{apt.time}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)} border ${getStatusColor(apt.status).replace('bg-', 'border-').replace('text-', 'border-')}/20`}>
                      {apt.status}
                    </span>
                    <button className="text-sm text-secondary hover:text-secondary/80 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
