export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Today's Queue</h3>
          <p className="text-3xl font-bold text-primary mt-2">12</p>
          <p className="text-sm text-gray-500 mt-1">Patients waiting</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Recent Lab Results</h3>
          <p className="text-3xl font-bold text-secondary mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1">Require review</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Quick Search</h2>
        </div>
        <div className="p-6">
          <input 
            type="text" 
            placeholder="Search patient by name or ID..." 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
