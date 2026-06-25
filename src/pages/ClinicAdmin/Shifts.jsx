import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Shifts() {
  const [shifts, setShifts] = useState([
    { id: 1, name: 'Morning', startTime: '08:00', endTime: '16:00' },
    { id: 2, name: 'Evening', startTime: '16:00', endTime: '00:00' },
    { id: 3, name: 'Night', startTime: '00:00', endTime: '08:00' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', startTime: '', endTime: '' });

  const handleOpenModal = (shift = null) => {
    if (shift) {
      setEditingId(shift.id);
      setFormData({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime });
    } else {
      setEditingId(null);
      setFormData({ name: '', startTime: '', endTime: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveShift = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      setShifts(shifts.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      setShifts([...shifts, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteShift = (id) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Shift Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Shift</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Shift Name</th>
              <th className="p-4 font-semibold text-gray-600">Start Time</th>
              <th className="p-4 font-semibold text-gray-600">End Time</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(shift => (
              <tr key={shift.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{shift.name}</td>
                <td className="p-4 text-gray-600">{shift.startTime}</td>
                <td className="p-4 text-gray-600">{shift.endTime}</td>
                <td className="p-4 flex justify-end space-x-2">
                  <button onClick={() => handleOpenModal(shift)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteShift(shift.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">No shifts defined. Add your first shift above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Shift' : 'Add New Shift'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Morning Shift" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveShift}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Save Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
