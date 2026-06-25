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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Patient Registration</h1>
      </div>

      <div className="bg-white p-8 rounded-[20px] shadow-subtle border border-border-light">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Age</label>
              <input 
                type="number" 
                required 
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400" 
                placeholder="30" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Contact Number</label>
              <input 
                type="tel" 
                required 
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400" 
                placeholder="+1 234 567 890" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Blood Group</label>
              <select 
                required 
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm"
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

          <div className="pt-6 border-t border-border-light">
            <button 
              type="submit"
              className="w-full h-11 bg-primary text-white rounded-full hover:bg-primary-600 transition font-bold shadow-primary cursor-pointer"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
