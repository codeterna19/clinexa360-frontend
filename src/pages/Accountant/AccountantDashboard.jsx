export default function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Accountant Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light">
          <h3 className="text-lg font-bold text-text-primary">Pending Invoices</h3>
          <p className="text-3xl font-bold text-primary mt-2">12</p>
        </div>
      </div>
    </div>
  );
}
