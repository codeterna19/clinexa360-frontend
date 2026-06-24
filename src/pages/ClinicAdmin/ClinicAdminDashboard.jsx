import { Calendar, Users, Activity, Clock } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/clinicadmin');
        setStats(data);
      } catch (error) {
        console.error('Error fetching clinic admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-semibold text-lg mb-4">Upcoming Appointments</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            List Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-semibold text-lg mb-4">Revenue Today</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
