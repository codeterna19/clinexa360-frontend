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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Electronic Medical Records (EMR)</h1>
      </div>

      <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Patient by ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400"
          />
        </div>
        <button onClick={handleSearch} className="bg-primary text-white h-11 px-8 rounded-full font-bold hover:bg-primary-600 transition shadow-primary whitespace-nowrap cursor-pointer">
          Search
        </button>
      </div>

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Profile Snapshot */}
          <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-text-primary border-b border-border-light pb-3 mb-4">Patient Profile</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-text-secondary font-medium">Name:</span> <span className="font-bold text-text-primary ml-1">{patient.name}</span></p>
              <p><span className="text-text-secondary font-medium">ID:</span> <span className="font-bold text-text-primary ml-1">{patient.id}</span></p>
              <p><span className="text-text-secondary font-medium">Age:</span> <span className="font-bold text-text-primary ml-1">{patient.age}</span></p>
              <p><span className="text-text-secondary font-medium">Blood Group:</span> <span className="font-bold text-red-600 ml-1">{patient.bloodGroup}</span></p>
            </div>
            <button 
              onClick={() => setShowNewEncounter(true)}
              className="mt-6 w-full flex justify-center items-center space-x-2 bg-primary-light text-primary h-11 rounded-full font-bold hover:bg-primary hover:text-white transition cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>New Medical Encounter</span>
            </button>
          </div>

          {/* Historical Encounters / Main View */}
          <div className="bg-white p-6 rounded-[20px] shadow-subtle border border-border-light lg:col-span-2">
            
            {showNewEncounter ? (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-border-light pb-3">
                  <h2 className="text-lg font-bold text-primary">New Encounter Form</h2>
                  <button onClick={() => setShowNewEncounter(false)} className="text-text-secondary hover:text-text-primary font-medium text-sm cursor-pointer transition-colors">Cancel</button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Symptoms</label>
                    <textarea 
                      value={encounterData.symptoms} onChange={e => setEncounterData({...encounterData, symptoms: e.target.value})}
                      className="w-full p-4 border border-border-light rounded-[20px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24 resize-none text-sm placeholder-gray-400"
                      placeholder="Describe patient symptoms..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Diagnosis</label>
                    <input 
                      type="text" value={encounterData.diagnosis} onChange={e => setEncounterData({...encounterData, diagnosis: e.target.value})}
                      className="w-full h-11 px-4 border border-border-light rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm placeholder-gray-400"
                      placeholder="Enter primary diagnosis..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 ml-1">Prescription / Treatment</label>
                    <textarea 
                      value={encounterData.prescription} onChange={e => setEncounterData({...encounterData, prescription: e.target.value})}
                      className="w-full p-4 border border-border-light rounded-[20px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none text-sm placeholder-gray-400"
                      placeholder="Medications, dosage, and treatment plan..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={handleSaveEncounter} className="bg-primary text-white h-11 px-8 rounded-full font-bold hover:bg-primary-600 transition shadow-primary cursor-pointer">
                      Save & Complete Encounter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-text-primary border-b border-border-light pb-3 mb-4">Historical Encounters</h2>
                <div className="space-y-4">
                  {patient.encounters.map((enc, idx) => (
                    <div key={idx} className="border border-border-light rounded-[16px] p-5 hover:shadow-subtle transition-shadow bg-slate-50/50">
                      <div className="flex justify-between text-sm text-text-secondary mb-3">
                        <span className="font-medium flex items-center text-primary"><Activity size={16} className="mr-1.5" /> {enc.date}</span>
                        <span className="font-medium">By: <span className="text-text-primary">{enc.doctor}</span></span>
                      </div>
                      <p className="font-bold text-text-primary flex items-center"><FileText size={18} className="mr-2 text-text-secondary" /> {enc.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
