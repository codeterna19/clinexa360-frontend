import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, Calendar, Clock, Edit2 } from 'lucide-react';

export default function Subscriptions() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  const [globalFeatures, setGlobalFeatures] = useState([]);
  const [globalPlans, setGlobalPlans] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    subscriptionPlan: '',
    subscriptionExpiry: '',
    customFeatures: [] // Array of feature IDs
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const [clinicsRes, featuresRes, plansRes] = await Promise.all([
        api.get('/clinics'),
        api.get('/features'),
        api.get('/plans')
      ]);
      setClinics(clinicsRes.data);
      setGlobalFeatures(featuresRes.data.filter(f => f.isActive));
      setGlobalPlans(plansRes.data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (clinic) => {
    setSelectedClinic(clinic);
    setFormData({
      subscriptionPlan: clinic.subscriptionPlan?._id || '',
      subscriptionExpiry: clinic.subscriptionExpiry 
        ? new Date(clinic.subscriptionExpiry).toISOString().split('T')[0] 
        : '',
      customFeatures: (clinic.customFeatures || []).map(f => f._id || f)
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomFeatureChange = (featureId, checked) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, customFeatures: [...prev.customFeatures, featureId] };
      } else {
        return { ...prev, customFeatures: prev.customFeatures.filter(id => id !== featureId) };
      }
    });
  };

  const calculateCustomTotal = () => {
    return formData.customFeatures.reduce((total, featureId) => {
      const feature = globalFeatures.find(f => f._id === featureId);
      return total + (feature ? Number(feature.price) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clinics/${selectedClinic._id}/subscription`, formData);
      setShowModal(false);
      setSelectedClinic(null);
      fetchClinics();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating subscription');
    }
  };

  const getPlanColor = (plan) => {
    switch(plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pro': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Custom': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscriptions</h1>
          <p className="text-text-secondary mt-1">Manage billing and subscription plans for all clinics</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-text-secondary">Loading...</div>
      ) : (
        <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-border-light text-slate-500 text-xs font-semibold tracking-wide uppercase bg-slate-50/50">
                <th className="p-4">Clinic Name</th>
                <th className="p-4">Current Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-text-secondary">No clinics found</td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic._id} className="h-[72px] hover:bg-slate-50 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-text-primary">{clinic.name}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{clinic.email}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xxs font-bold rounded-full border ${getPlanColor(clinic.subscriptionPlan?.name || 'Basic')}`}>
                        {clinic.subscriptionPlan?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xxs font-bold rounded-full border ${
                        clinic.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-text-secondary font-medium">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2 opacity-70" />
                        {clinic.subscriptionExpiry 
                          ? new Date(clinic.subscriptionExpiry).toLocaleDateString() 
                          : 'No expiry set'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleEditClick(clinic)}
                          className="px-4 py-1.5 rounded-full transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center text-xs font-semibold cursor-pointer"
                        >
                          <Edit2 size={14} className="mr-1.5" /> Change Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-text-primary">Update Subscription</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Clinic</label>
                      <input type="text" readOnly value={selectedClinic?.name} className="mt-1.5 h-11 block w-full bg-slate-50 border border-border-light rounded-full shadow-sm px-4 sm:text-sm text-text-secondary outline-none cursor-default" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1">Subscription Plan</label>
                      <select name="subscriptionPlan" value={formData.subscriptionPlan} onChange={handleInputChange} required className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm appearance-none bg-white">
                        <option value="">Select a Plan</option>
                        {globalPlans.map(plan => (
                          <option key={plan._id} value={plan._id}>{plan.name} {plan.name !== 'Custom' ? `(₹${plan.price})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {globalPlans.find(p => p._id === formData.subscriptionPlan)?.name === 'Custom' && (
                      <div className="bg-slate-50 p-4 rounded-[20px] border border-border-light space-y-3 mt-2">
                        <h4 className="text-sm font-bold text-text-primary border-b border-border-light pb-2">Select Features</h4>
                        {globalFeatures.length === 0 ? (
                           <p className="text-sm text-text-secondary">No active features found. Create them in Feature Management.</p>
                        ) : (
                          globalFeatures.map((feature) => (
                            <div key={feature._id} className="flex items-center justify-between">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={formData.customFeatures.includes(feature._id)}
                                  onChange={(e) => handleCustomFeatureChange(feature._id, e.target.checked)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <div>
                                  <span className="text-sm text-text-primary font-medium block">{feature.name}</span>
                                  {feature.description && <span className="text-xs text-text-secondary">{feature.description}</span>}
                                </div>
                              </label>
                              <div className="flex items-center">
                                <span className="text-sm font-bold text-text-primary">₹{feature.price}</span>
                              </div>
                            </div>
                          ))
                        )}
                        <div className="pt-3 mt-3 border-t border-border-light flex justify-between font-bold">
                          <span className="text-sm text-text-primary">Total Price:</span>
                          <span className="text-sm text-primary">₹{calculateCustomTotal()}</span>
                        </div>
                      </div>
                    )}
                    
                    {globalPlans.find(p => p._id === formData.subscriptionPlan) && 
                     globalPlans.find(p => p._id === formData.subscriptionPlan)?.name !== 'Custom' && (
                      <div className="bg-slate-50 p-4 rounded-[20px] border border-border-light mt-2">
                        <h4 className="text-sm font-bold text-text-primary border-b border-border-light pb-2 mb-3">Included Features</h4>
                        <div className="space-y-2">
                          {globalPlans.find(p => p._id === formData.subscriptionPlan).features.map(featureId => {
                            const feature = globalFeatures.find(f => f._id === featureId);
                            if (!feature) return null;
                            return (
                              <div key={feature._id} className="flex items-center text-sm font-medium text-text-secondary">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {feature.name}
                              </div>
                            );
                          })}
                          {globalPlans.find(p => p._id === formData.subscriptionPlan).features.length === 0 && (
                            <p className="text-sm text-text-secondary">No specific features assigned to this plan.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-text-primary ml-1 mt-2">Expiry Date</label>
                      <input type="date" name="subscriptionExpiry" value={formData.subscriptionExpiry} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm text-text-primary" />
                    </div>
                  </div>
                <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t border-border-light -mx-6 -mb-6">
                  <button type="submit" className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2.5 bg-primary font-bold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-full border border-border-light shadow-sm px-6 py-2.5 bg-white font-bold text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
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
