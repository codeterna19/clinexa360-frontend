import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, Plus, Clock, CheckCircle, UserPlus, CreditCard, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-[20px] shadow-subtle border border-border-light p-6 flex items-center transition-transform hover:-translate-y-1">
    <div className={`${bg} ${color} p-4 rounded-xl mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <h3 className="text-2xl font-bold text-text-primary mt-1">{value}</h3>
    </div>
  </div>
);

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resApts, resBills, resPatients] = await Promise.all([
        api.get('/appointments'),
        api.get('/bills'),
        api.get('/patients')
      ]);
      setAppointments(resApts.data);
      setBills(resBills.data);
      setPatients(resPatients.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
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

  // Timezone helpers
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

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const parseDbDate = (dateStr) => {
    if (!dateStr) return null;
    return getKolkataDate(new Date(dateStr));
  };

  const todayDate = getKolkataDate(new Date());

  // Filter today's appointments
  const todaysAppointments = appointments.filter(apt => {
    if (!apt.date) return false;
    const aptDate = parseDbDate(apt.date);
    return isSameDay(aptDate, todayDate);
  });

  // Calculate today's revenue from bills
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysPaidBills = bills.filter(bill => {
    if (bill.status !== 'Paid') return false;
    const billDate = new Date(bill.createdAt);
    return billDate >= todayStart && billDate <= todayEnd;
  });

  const totalRevenueToday = todaysPaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAptsCount = todaysAppointments.filter(apt => apt.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Receptionist Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage check-ins, registrations, and today's schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center text-text-secondary">Loading statistics...</div>
        ) : (
          <>
            <StatCard title="Today's Appointments" value={todaysAppointments.length} icon={Calendar} color="text-secondary" bg="bg-blue-50" />
            <StatCard title="Daily Revenue" value={`₹${totalRevenueToday.toFixed(0)}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Total Patients" value={patients.length} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard title="Pending Status" value={pendingAptsCount} icon={Clock} color="text-orange-600" bg="bg-orange-50" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Queue / Appointments List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[20px] shadow-subtle border border-border-light flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-lg text-text-primary flex items-center">
              <Clock className="text-primary mr-2" size={20} /> Today's Queue
            </h3>
            <span className="text-xs bg-primary-light text-primary px-3 py-1 rounded-full font-bold">
              {todaysAppointments.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="text-center py-10 text-text-secondary text-sm">Loading schedule...</div>
            ) : todaysAppointments.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-text-secondary">
                <Calendar size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {todaysAppointments.map(apt => (
                  <div key={apt._id} className="flex items-center justify-between py-4 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
                        {apt.patient_id?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">{apt.patient_id?.name || 'Unknown Patient'}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xxs text-text-secondary font-medium">Dr. {apt.doctor_id?.name || 'Unknown'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-xxs text-primary font-bold">{apt.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="inline-block text-xxs font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full">{apt.time}</span>
                      </div>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)} border cursor-pointer outline-none appearance-none`}
                        style={{ textAlignLast: 'center' }}
                        title="Update Status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Short Lists */}
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light space-y-4">
            <h3 className="font-semibold text-lg text-text-primary">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => navigate('/receptionist/patients', { state: { openAddModal: true } })}
                className="w-full h-12 bg-primary text-white rounded-full font-bold flex items-center justify-center space-x-2 shadow-primary hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <UserPlus size={18} />
                <span>Register Patient</span>
              </button>
              <button 
                onClick={() => navigate('/receptionist/appointments', { state: { openBookModal: true } })}
                className="w-full h-12 bg-white border border-border-light text-text-primary rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar size={18} className="text-primary" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-text-primary text-md">Recent Payments</h3>
              <button 
                onClick={() => navigate('/receptionist/billing')}
                className="text-xs text-primary font-bold hover:underline flex items-center"
              >
                <span>View Bills</span>
                <ArrowUpRight size={14} className="ml-0.5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-xs text-text-secondary">Loading...</div>
              ) : todaysPaidBills.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No payments recorded today.</p>
              ) : (
                todaysPaidBills.slice(0, 3).map(bill => (
                  <div key={bill._id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="font-semibold text-text-primary">{bill.patient_id?.name || 'Walk-in'}</span>
                    </div>
                    <span className="font-bold text-text-primary">₹{bill.amount.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
