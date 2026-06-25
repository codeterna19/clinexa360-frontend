import { useState } from 'react';

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: '', age: '', contact: '', bloodGroup: '', gender: 'Male'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register Patient:', formData);
    // TODO: Send to backend
    alert('Patient registered successfully! (Mocked)');
    setFormData({ name: '', age: '', contact: '', bloodGroup: '', gender: 'Male' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Patient Registration</h1>
      </div>

      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input 
                type="number" 
                required 
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                placeholder="30" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input 
                type="tel" 
                required 
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                placeholder="+1 234 567 890" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select 
                required 
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit"
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
