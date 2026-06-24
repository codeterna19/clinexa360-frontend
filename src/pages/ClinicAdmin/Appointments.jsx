import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import api from '../../api/axios';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
        {/* Calendar Side panel Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="text-secondary" />
            <h3 className="font-semibold text-lg">Select Date</h3>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            Interactive Calendar Component (Coming Soon)
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Today's Schedule</h3>
            <span className="bg-secondary/10 text-secondary text-sm font-medium px-3 py-1 rounded-full">
              {appointments.length} Appointments
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No appointments scheduled</div>
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
                        <span className="text-gray-400">&bull; {new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                    <button className="text-sm text-secondary hover:underline font-medium">
                      View Details
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
