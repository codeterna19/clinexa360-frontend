import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Sun, Moon, Sunset, AlertCircle } from 'lucide-react';

export default function Shifts() {
  // Load initial shifts from localStorage or use defaults
  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem('clinic_shifts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved shifts:', e);
      }
    }
    return [
      { id: 1, name: 'Morning', startTime: '08:00', endTime: '16:00' },
      { id: 2, name: 'Evening', startTime: '16:00', endTime: '00:00' },
      { id: 3, name: 'Night', startTime: '00:00', endTime: '08:00' },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', startTime: '', endTime: '' });

  // Save shifts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clinic_shifts', JSON.stringify(shifts));
  }, [shifts]);

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

  // Helper: Format 24h to 12h AM/PM
  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let h = hour % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minuteStr} ${ampm}`;
  };

  // Helper: Calculate shift duration (accounting for midnight crossings)
  const getDurationHours = (start, end) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Crossed midnight
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (minutes === 0) {
      return `${hours} Hours`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Helper: Get theme styling based on shift name
  const getShiftTheme = (name) => {
    const cleanName = name.toLowerCase();
    if (cleanName.includes('morning') || cleanName.includes('day')) {
      return {
        icon: Sun,
        colorClass: 'text-amber-500 bg-amber-50',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        barColor: 'bg-amber-500'
      };
    }
    if (cleanName.includes('evening') || cleanName.includes('afternoon') || cleanName.includes('sunset')) {
      return {
        icon: Sunset,
        colorClass: 'text-indigo-500 bg-indigo-50',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        barColor: 'bg-indigo-500'
      };
    }
    if (cleanName.includes('night') || cleanName.includes('dark') || cleanName.includes('late')) {
      return {
        icon: Moon,
        colorClass: 'text-violet-500 bg-violet-50',
        badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
        barColor: 'bg-violet-500'
      };
    }
    return {
      icon: Clock,
      colorClass: 'text-primary-500 bg-primary-50',
      badgeClass: 'bg-primary-100 text-primary-800 border-primary-200',
      barColor: 'bg-primary-500'
    };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shift Management</h1>
          <p className="text-gray-500 mt-1">Configure and assign work hours for clinic doctors, receptionists, and staff</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
        >
          <Plus size={18} className="mr-2" />
          Add New Shift
        </button>
      </div>

      {/* Shifts Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map(shift => {
          const theme = getShiftTheme(shift.name);
          const IconComponent = theme.icon;
          return (
            <div 
              key={shift.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col relative"
            >
              {/* Left Top Accent Color Strip */}
              <div className={`h-1.5 w-full ${theme.barColor}`} />
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${theme.colorClass} flex items-center justify-center`}>
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{shift.name}</h3>
                      <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Active Shift</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Work Hours</span>
                    <span className="font-semibold text-gray-800">
                      {formatTime12h(shift.startTime)} to {formatTime12h(shift.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Duration</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-gray-50 text-gray-700 border-gray-200">
                      {getDurationHours(shift.startTime, shift.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex justify-end space-x-2">
                <button 
                  onClick={() => handleOpenModal(shift)} 
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Shift"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteShift(shift.id)} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Shift"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {shifts.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <AlertCircle size={40} className="text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Shifts Configured</h3>
            <p className="text-gray-500 max-w-sm text-sm">Get started by adding your first shift schedule using the button above.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Shift Details' : 'Add New Shift'}
              </h2>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow" 
                  placeholder="e.g. Night Shift, Morning Shift" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white" 
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4.5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveShift}
                className="px-4.5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm cursor-pointer shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Save Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
