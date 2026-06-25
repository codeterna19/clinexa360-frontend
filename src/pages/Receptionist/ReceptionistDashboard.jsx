export default function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Receptionist Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-border-light shadow-subtle">
          <h3 className="text-lg font-bold text-text-primary">Today's Appointments</h3>
          <p className="text-3xl font-bold text-primary mt-2">45</p>
        </div>
        
        <div className="bg-white p-6 rounded-[20px] border border-border-light shadow-subtle">
          <h3 className="text-lg font-bold text-text-primary">Daily Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">$1,250</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <button className="bg-primary text-white p-6 rounded-[20px] shadow-primary hover:bg-primary-600 transition text-lg font-bold text-center cursor-pointer">
          Register New Patient
        </button>
        <button className="bg-blue-600 text-white p-6 rounded-[20px] shadow-sm hover:bg-blue-700 transition text-lg font-bold text-center cursor-pointer">
          Book Appointment
        </button>
      </div>
    </div>
  );
}
