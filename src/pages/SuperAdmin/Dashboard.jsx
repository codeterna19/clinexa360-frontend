import { Users, Building2, CreditCard, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalDoctors: 0,
    activePatients: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/superadmin');
        setStats(data);
      } catch (error) {
        console.error('Error fetching superadmin stats:', error);
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
          <h1 className="text-2xl font-bold text-text-primary">Platform Overview</h1>
          <p className="text-text-secondary mt-1">Real-time statistics across all clinics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full py-10 text-center text-gray-500">Loading statistics...</div>
        ) : (
          <>
            <StatCard title="Total Clinics" value={stats.totalClinics} icon={Building2} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Total Doctors" value={stats.totalDoctors} icon={Users} color="text-indigo-600" bg="bg-indigo-100" />
            <StatCard title="Active Patients" value={stats.activePatients} icon={Activity} color="text-emerald-600" bg="bg-emerald-100" />
            <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue}`} icon={CreditCard} color="text-purple-600" bg="bg-purple-100" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light h-96">
          <h3 className="font-semibold text-lg mb-4 text-text-primary">Revenue Growth</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light h-96">
          <h3 className="font-semibold text-lg mb-4 text-text-primary">Recent Subscriptions</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            Table Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
