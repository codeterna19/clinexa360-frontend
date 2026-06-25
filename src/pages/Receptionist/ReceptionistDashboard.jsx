export default function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Receptionist Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Today's Appointments</h3>
          <p className="text-3xl font-bold text-primary mt-2">45</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Daily Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">$1,250</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <button className="bg-primary text-white p-6 rounded-xl shadow-sm hover:bg-primary/90 transition text-lg font-semibold text-center">
          Register New Patient
        </button>
        <button className="bg-secondary text-white p-6 rounded-xl shadow-sm hover:bg-secondary/90 transition text-lg font-semibold text-center">
          Book Appointment
        </button>
      </div>
    </div>
  );
}
