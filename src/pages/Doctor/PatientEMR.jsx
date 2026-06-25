import { useState } from 'react';
import { Search, FileText, PlusCircle, Activity } from 'lucide-react';

export default function PatientEMR() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patient, setPatient] = useState(null); // Mock selected patient
  
  const [showNewEncounter, setShowNewEncounter] = useState(false);
  const [encounterData, setEncounterData] = useState({
    symptoms: '', diagnosis: '', prescription: '', notes: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Mocking a patient search result
    if (searchQuery.trim() !== '') {
      setPatient({
        id: 'PT-10023',
        name: 'Jane Smith',
        age: 28,
        bloodGroup: 'O+',
        lastVisit: '2023-10-15',
        encounters: [
          { date: '2023-10-15', diagnosis: 'Viral Fever', doctor: 'Dr. Adams' }
        ]
      });
    }
  };

  const handleSaveEncounter = () => {
    alert('Encounter saved to patient history! (Mocked)');
    setShowNewEncounter(false);
    setEncounterData({ symptoms: '', diagnosis: '', prescription: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Electronic Medical Records (EMR)</h1>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Patient by ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <button onClick={handleSearch} className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
          Search
        </button>
      </div>

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Profile Snapshot */}
          <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Patient Profile</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{patient.name}</span></p>
              <p><span className="text-gray-500">ID:</span> <span className="font-medium text-gray-900">{patient.id}</span></p>
              <p><span className="text-gray-500">Age:</span> <span className="font-medium text-gray-900">{patient.age}</span></p>
              <p><span className="text-gray-500">Blood Group:</span> <span className="font-medium text-red-600">{patient.bloodGroup}</span></p>
            </div>
            <button 
              onClick={() => setShowNewEncounter(true)}
              className="mt-6 w-full flex justify-center items-center space-x-2 bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition"
            >
              <PlusCircle size={18} />
              <span>New Medical Encounter</span>
            </button>
          </div>

          {/* Historical Encounters / Main View */}
          <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
            
            {showNewEncounter ? (
              <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-lg font-bold text-primary">New Encounter Form</h2>
                  <button onClick={() => setShowNewEncounter(false)} className="text-gray-500 hover:text-gray-800">Cancel</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                    <textarea 
                      value={encounterData.symptoms} onChange={e => setEncounterData({...encounterData, symptoms: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-20"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input 
                      type="text" value={encounterData.diagnosis} onChange={e => setEncounterData({...encounterData, diagnosis: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescription / Treatment</label>
                    <textarea 
                      value={encounterData.prescription} onChange={e => setEncounterData({...encounterData, prescription: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-24"
                    ></textarea>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={handleSaveEncounter} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                      Save & Complete Encounter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Historical Encounters</h2>
                {patient.encounters.map((enc, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-4 hover:shadow-md transition">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span><Activity size={14} className="inline mr-1" /> {enc.date}</span>
                      <span>By: {enc.doctor}</span>
                    </div>
                    <p className="font-semibold text-gray-800"><FileText size={16} className="inline mr-1 text-gray-400" /> {enc.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
