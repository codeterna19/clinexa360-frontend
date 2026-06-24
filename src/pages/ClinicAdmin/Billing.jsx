import { useState, useEffect } from 'react';
import { CreditCard, FileText, Search, Plus, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../api/axios';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    payment_mode: 'Cash'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, patientsRes] = await Promise.all([
        api.get('/bills'),
        api.get('/patients')
      ]);
      setBills(billsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills', formData);
      setShowModal(false);
      setFormData({ patient_id: '', amount: '', payment_mode: 'Cash' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating invoice');
    }
  };

  const handleCollect = async (id) => {
    try {
      await api.put(`/bills/${id}/status`, { status: 'Paid' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating payment status');
    }
  };

  // Calculations
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));

  const totalRevenueToday = bills
    .filter(b => b.status === 'Paid' && new Date(b.createdAt) >= todayStart)
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingReceivables = bills
    .filter(b => b.status === 'Pending')
    .reduce((sum, b) => sum + b.amount, 0);

  const filteredBills = bills.filter(b => 
    b.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.patient_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & POS</h1>
          <p className="text-gray-500 mt-1">Generate invoices and collect payments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
        >
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
            <p className="text-xl font-bold text-gray-900 mt-1">₹{totalRevenueToday.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg"><Clock size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-900">Pending Receivables</h4>
            <p className="text-xl font-bold text-gray-900 mt-1">₹{pendingReceivables.toFixed(2)}</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No invoices found</td>
                </tr>
              ) : filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{bill.invoice_number}</td>
                  <td className="p-4 text-gray-600">{bill.patient_id?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-600">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">₹{bill.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${
                      bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bill.status === 'Paid' && <CheckCircle size={12} />}
                      {bill.status === 'Pending' && <Clock size={12} />}
                      <span>{bill.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{bill.payment_mode || '-'}</td>
                  <td className="p-4 text-right">
                    {bill.status === 'Pending' ? (
                      <button onClick={() => handleCollect(bill._id)} className="text-primary-600 hover:text-primary-800 font-medium text-sm">Collect</button>
                    ) : (
                      <span className="text-gray-400 text-sm">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Generate Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Patient</label>
                    <select 
                      name="patient_id" 
                      required 
                      value={formData.patient_id} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input 
                      type="number" 
                      name="amount" 
                      required 
                      min="0"
                      step="0.01"
                      value={formData.amount} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <select 
                      name="payment_mode" 
                      required 
                      value={formData.payment_mode} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-6 -mb-6 border-t">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Generate Invoice
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
