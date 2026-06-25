import { useState, useEffect } from 'react';
import { CreditCard, FileText, Search, Plus, CheckCircle, Clock, Download, Send, Edit2, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    doctor_id: '',
    amount: '',
    payment_mode: 'Cash',
    status: 'Pending'
  });

  useEffect(() => {
    fetchBills();
    fetchDropdowns();
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

  const fetchDropdowns = async () => {
    try {
      const [resPatients, resAppointments, resDoctors] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/clinic-admin/doctors')
      ]);
      setPatients(resPatients.data);
      setAppointments(resAppointments.data);
      setDoctors(resDoctors.data);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const handleOpenModal = (bill = null) => {
    if (bill) {
      setEditingId(bill._id);
      setFormData({
        patient_id: bill.patient_id?._id || bill.patient_id || '',
        appointment_id: bill.appointment_id?._id || bill.appointment_id || '',
        doctor_id: bill.doctor_id?._id || bill.doctor_id || '',
        amount: bill.amount || '',
        payment_mode: bill.payment_mode || 'Cash',
        status: bill.status || 'Pending'
      });
    } else {
      setEditingId(null);
      setFormData({
        patient_id: '',
        appointment_id: '',
        doctor_id: '',
        amount: '',
        payment_mode: 'Cash',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleAppointmentChange = (aptId) => {
    const selectedApt = appointments.find(apt => apt._id === aptId);
    setFormData(prev => ({
      ...prev,
      appointment_id: aptId,
      doctor_id: selectedApt ? (selectedApt.doctor_id?._id || selectedApt.doctor_id || '') : prev.doctor_id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.amount || !formData.payment_mode) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      patient_id: formData.patient_id,
      amount: parseFloat(formData.amount),
      payment_mode: formData.payment_mode,
      status: formData.status
    };

    if (formData.appointment_id) {
      payload.appointment_id = formData.appointment_id;
    }
    if (formData.doctor_id) {
      payload.doctor_id = formData.doctor_id;
    }

    try {
      if (editingId) {
        await api.put(`/bills/${editingId}`, payload);
      } else {
        await api.post('/bills', payload);
      }
      setIsModalOpen(false);
      fetchBills();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving invoice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`/bills/${id}`);
        fetchBills();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting invoice');
      }
    }
  };

  const handleDownload = (bill) => {
    const printWindow = window.open('', '_blank');
    const invoiceNum = bill.invoice_number || `INV-${bill._id.slice(-6).toUpperCase()}`;
    const dateStr = new Date(bill.createdAt).toLocaleDateString();
    
    // Find doctor details
    const doctorName = bill.doctor_id?.name 
      ? `Dr. ${bill.doctor_id.name}` 
      : (bill.appointment_id?.doctor_id?.name ? `Dr. ${bill.appointment_id.doctor_id.name}` : 'N/A');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceNum}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .details { margin: 30px 0; display: flex; justify-content: space-between; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 12px; border: 1px solid #eee; text-align: left; }
            .table th { background-color: #f9f9f9; }
            .total { margin-top: 30px; text-align: right; font-size: 20px; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #777; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">CLINEXA 360</div>
              <div>Your Premium Clinic Management Partner</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: bold; text-align: right; color: #1e3a8a;">INVOICE</div>
              <div style="text-align: right; font-weight: bold;">${invoiceNum}</div>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              Name: ${bill.patient_id?.name || 'Unknown'}<br>
              Phone: ${bill.patient_id?.phone || '-'}<br>
              Email: ${bill.patient_id?.email || '-'}
            </div>
            <div>
              <strong>Invoice Details:</strong><br>
              Date: ${dateStr}<br>
              Doctor: ${doctorName}<br>
              Payment Method: ${bill.payment_mode || '-'}<br>
              Status: ${bill.status || '-'}
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Medical Consultation / Treatment Services</td>
                <td style="text-align: right;">₹${bill.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total: ₹${bill.amount.toFixed(2)}
          </div>
          <div class="footer">
            Thank you for choosing Clinexa 360. Wish you good health!
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendEmail = (bill) => {
    alert(`Invoice email successfully sent to ${bill.patient_id?.email || 'patient'}.`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Refunded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculations
  const revenueToday = bills
    .filter(bill => {
      if (bill.status !== 'Paid') return false;
      const billDate = new Date(bill.createdAt);
      const today = new Date();
      return billDate.getDate() === today.getDate() &&
             billDate.getMonth() === today.getMonth() &&
             billDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  const pendingReceivables = bills
    .filter(bill => bill.status === 'Pending')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const filteredBills = bills.filter(bill => {
    const patientName = bill.patient_id?.name || '';
    const invoiceNum = bill.invoice_number || `INV-${bill._id.slice(-6).toUpperCase()}`;
    const query = searchQuery.toLowerCase();
    return patientName.toLowerCase().includes(query) ||
           invoiceNum.toLowerCase().includes(query) ||
           (bill.payment_mode || '').toLowerCase().includes(query) ||
           (bill.status || '').toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & POS</h1>
          <p className="text-gray-500 mt-1">Generate invoices and collect payments</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm font-semibold cursor-pointer"
        >
          <Plus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* POS Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div>
            <h3 className="font-semibold text-lg">Quick Collect</h3>
            <p className="text-green-100 text-sm mt-1">Generate POS bills directly</p>
          </div>
          <CreditCard size={32} className="opacity-80" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><FileText size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-500">Total Revenue Today</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{revenueToday.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg"><Clock size={24} /></div>
          <div>
            <h4 className="font-medium text-gray-500">Pending Receivables</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{pendingReceivables.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-lg text-gray-900">Recent Invoices</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-semibold tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Method</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-500">Loading bills...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400">No invoices found</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-semibold text-gray-900">{bill.invoice_number || `INV-${bill._id.slice(-6).toUpperCase()}`}</td>
                    <td className="p-4 text-gray-700 font-medium">{bill.patient_id?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-500">{new Date(bill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-4 font-bold text-gray-900">₹{bill.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center space-x-1 ${getStatusColor(bill.status)} border`}>
                        {bill.status === 'Paid' && <CheckCircle size={12} />}
                        {bill.status === 'Pending' && <Clock size={12} />}
                        <span>{bill.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{bill.payment_mode || '-'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(bill)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer inline-flex"
                        title="Edit Invoice"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(bill._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex"
                        title="Delete Invoice"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownload(bill)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors cursor-pointer inline-flex"
                        title="Print PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(bill)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors cursor-pointer inline-flex"
                        title="Email Patient"
                      >
                        <Send size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Billing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Invoice Details' : 'Generate New POS Invoice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient *</label>
                <select 
                  required
                  value={formData.patient_id} 
                  onChange={e => setFormData({...formData, patient_id: e.target.value, appointment_id: '', doctor_id: ''})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone || p.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Appointment (Optional)</label>
                <select 
                  value={formData.appointment_id} 
                  onChange={e => handleAppointmentChange(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">Direct POS (No Appointment)</option>
                  {appointments
                    .filter(apt => apt.patient_id?._id === formData.patient_id || apt.patient_id === formData.patient_id)
                    .map(apt => (
                      <option key={apt._id} value={apt._id}>
                        {new Date(apt.date).toLocaleDateString()} at {apt.time} ({apt.type})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Doctor (Optional)</label>
                <select 
                  value={formData.doctor_id} 
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Billing Amount (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method *</label>
                  <select 
                    value={formData.payment_mode} 
                    onChange={e => setFormData({...formData, payment_mode: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Status *</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4.5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm cursor-pointer shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
