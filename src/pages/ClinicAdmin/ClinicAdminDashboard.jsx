import { Calendar, Users, Activity, Clock, DollarSign, ArrowUpRight, Receipt, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-transform hover:-translate-y-1">
    <div className={`${bg} ${color} p-4 rounded-lg mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

export default function ClinicAdminDashboard() {
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    activeDoctors: 0,
    pendingFollowUps: 0,
    patientsTreated: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const parseDbDate = (dateStr) => {
    if (!dateStr) return null;
    return getKolkataDate(new Date(dateStr));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resStats, resApts, resBills] = await Promise.all([
          api.get('/dashboard/clinicadmin'),
          api.get('/appointments'),
          api.get('/bills')
        ]);
        setStats(resStats.data);
        setAppointments(resApts.data);
        setBills(resBills.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Filter Upcoming Appointments (Today and future, excluding Completed/Cancelled)
  const today = getKolkataDate(new Date());
  const upcomingApts = appointments
    .filter(apt => {
      if (!apt.date || apt.status === 'Cancelled' || apt.status === 'Completed') return false;
      const aptDate = parseDbDate(apt.date);
      return aptDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  // Calculate Today's Paid Invoices and Revenue
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

  // Calculate Payment Mode Breakdown
  const modeCounts = { UPI: 0, Cash: 0, Card: 0, 'Net Banking': 0 };
  todaysPaidBills.forEach(bill => {
    const mode = bill.payment_mode || 'Cash';
    if (modeCounts[mode] !== undefined) {
      modeCounts[mode] += bill.amount;
    }
  });

  const totalModeAmount = Object.values(modeCounts).reduce((sum, amt) => sum + amt, 0);
  const modePercentages = {};
  Object.keys(modeCounts).forEach(mode => {
    modePercentages[mode] = totalModeAmount > 0 ? (modeCounts[mode] / totalModeAmount) * 100 : 0;
  });

  const recentTransactions = todaysPaidBills.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Dashboard</h1>
          <p className="text-gray-500 mt-1">Today's overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center text-gray-500">Loading statistics...</div>
        ) : (
          <>
            <StatCard title="Today's Appointments" value={stats.todaysAppointments} icon={Calendar} color="text-secondary" bg="bg-secondary/10" />
            <StatCard title="Active Doctors" value={stats.activeDoctors} icon={Users} color="text-indigo-600" bg="bg-indigo-100" />
            <StatCard title="Pending Follow-ups" value={stats.pendingFollowUps} icon={Clock} color="text-orange-600" bg="bg-orange-100" />
            <StatCard title="Patients Treated" value={stats.patientsTreated} icon={Activity} color="text-emerald-600" bg="bg-emerald-100" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center"><Calendar className="text-primary-600 mr-2" size={20} /> Upcoming Appointments</h3>
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-bold">{upcomingApts.length} Pending</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading schedule...</div>
            ) : upcomingApts.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                <Calendar size={36} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                {upcomingApts.map(apt => (
                  <div key={apt._id} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/60 border border-gray-100 rounded-xl transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {apt.patient_id?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{apt.patient_id?.name || 'Unknown Patient'}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xxs text-gray-500 font-medium">Dr. {apt.doctor_id?.name?.split(' ')[0] || 'Unknown'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-xxs text-primary-600 font-bold">{apt.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-xxs font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-md mb-1">{apt.time}</span>
                      <p className="text-xxs text-gray-400 font-bold">{apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Today Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center"><DollarSign className="text-emerald-600 mr-1.5" size={20} /> Revenue Today</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold flex items-center"><TrendingUp size={12} className="mr-1" /> Live Tracker</span>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading transactions...</div>
            ) : (
              <div className="space-y-4 w-full">
                {/* Total amount callout */}
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Earnings (Paid)</span>
                    <h2 className="text-3xl font-black text-emerald-700 mt-0.5">₹{totalRevenueToday.toFixed(2)}</h2>
                  </div>
                  <div className="bg-emerald-500 text-white p-2.5 rounded-xl"><DollarSign size={24} /></div>
                </div>

                {/* Progress breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <span>Payment Methods</span>
                    <span>₹{totalRevenueToday.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {Object.keys(modeCounts).map(mode => {
                      const percentage = modePercentages[mode] || 0;
                      const amount = modeCounts[mode] || 0;
                      return (
                        <div key={mode} className="text-xs">
                          <div className="flex justify-between text-gray-600 font-semibold mb-0.5">
                            <span>{mode}</span>
                            <span>₹{amount.toFixed(0)} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                mode === 'UPI' ? 'bg-primary-500' :
                                mode === 'Cash' ? 'bg-amber-500' :
                                mode === 'Card' ? 'bg-indigo-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent paid transactions */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Payments</div>
                  {recentTransactions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No payments recorded today.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {recentTransactions.map(bill => (
                        <div key={bill._id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle size={12} className="text-emerald-500" />
                            <span className="font-semibold text-gray-800">{bill.patient_id?.name || 'Walk-in'}</span>
                            <span className="text-gray-400">({bill.invoice_number || `INV-${bill._id.slice(-4).toUpperCase()}`})</span>
                          </div>
                          <span className="font-bold text-gray-900">₹{bill.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
