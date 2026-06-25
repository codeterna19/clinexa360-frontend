export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-border-light shadow-subtle">
          <h3 className="text-lg font-bold text-text-primary">Today's Queue</h3>
          <p className="text-3xl font-bold text-primary mt-2">12</p>
          <p className="text-sm font-medium text-text-secondary mt-1">Patients waiting</p>
        </div>
        
        <div className="bg-white p-6 rounded-[20px] border border-border-light shadow-subtle">
          <h3 className="text-lg font-bold text-text-primary">Recent Lab Results</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          <p className="text-sm font-medium text-text-secondary mt-1">Require review</p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-border-light shadow-subtle mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-border-light bg-slate-50/50">
          <h2 className="text-lg font-bold text-text-primary">Quick Search</h2>
        </div>
        <div className="p-6">
          <input 
            type="text" 
            placeholder="Search patient by name or ID..." 
            className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
