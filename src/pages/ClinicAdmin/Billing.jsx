import { useState, useEffect } from 'react';
import { CreditCard, FileText, Search, Plus, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/bills');
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & POS</h1>
          <p className="text-gray-500 mt-1">Generate invoices and collect payments</p>
        </div>
        <button className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary/90 transition-colors">
          <Plus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* POS Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-semibold text-lg">Quick Collect</h3>
            <p className="text-green-100 text-sm mt-1">Process pending payments</p>
          </div>
          <CreditCard size={32} className="opacity-80" />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><FileText size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-900">Total Revenue Today</h4>
            <p className="text-xl font-bold text-gray-900 mt-1">...</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg"><Clock size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-900">Pending Receivables</h4>
            <p className="text-xl font-bold text-gray-900 mt-1">...</p>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-lg">Recent Invoices</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">Loading bills...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No invoices found</td>
                </tr>
              ) : bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">INV-{bill._id.slice(-5).toUpperCase()}</td>
                  <td className="p-4 text-gray-600">{bill.appointment_id?.patient_id?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-600">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">₹{bill.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center inline-flex space-x-1 ${
                      bill.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.payment_status === 'Paid' && <CheckCircle size={12} />}
                      {bill.payment_status === 'Pending' && <Clock size={12} />}
                      <span>{bill.payment_status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{bill.payment_method || '-'}</td>
                  <td className="p-4 text-right">
                    {bill.payment_status === 'Pending' ? (
                      <button className="text-secondary hover:text-secondary/80 font-medium text-sm">Collect</button>
                    ) : (
                      <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
