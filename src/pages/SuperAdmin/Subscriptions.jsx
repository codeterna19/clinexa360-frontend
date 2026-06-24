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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500">Manage billing and subscription plans for all clinics</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No clinics found</td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                      <div className="text-sm text-gray-500">{clinic.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPlanColor(clinic.subscriptionPlan?.name || 'Basic')}`}>
                        {clinic.subscriptionPlan?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        clinic.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {clinic.subscriptionExpiry 
                          ? new Date(clinic.subscriptionExpiry).toLocaleDateString() 
                          : 'No expiry set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(clinic)}
                        className="text-primary-600 hover:text-primary-900 flex items-center justify-end w-full"
                      >
                        <Edit2 size={16} className="mr-1" /> Change Plan
                      </button>
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
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Update Subscription</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clinic</label>
                      <input type="text" readOnly value={selectedClinic?.name} className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                      <select name="subscriptionPlan" value={formData.subscriptionPlan} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="">Select a Plan</option>
                        {globalPlans.map(plan => (
                          <option key={plan._id} value={plan._id}>{plan.name} {plan.name !== 'Custom' ? `(₹${plan.price})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {globalPlans.find(p => p._id === formData.subscriptionPlan)?.name === 'Custom' && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Select Features</h4>
                        {globalFeatures.length === 0 ? (
                           <p className="text-sm text-gray-500">No active features found. Create them in Feature Management.</p>
                        ) : (
                          globalFeatures.map((feature) => (
                            <div key={feature._id} className="flex items-center justify-between">
                              <label className="flex items-center space-x-2">
                                <input 
                                  type="checkbox" 
                                  checked={formData.customFeatures.includes(feature._id)}
                                  onChange={(e) => handleCustomFeatureChange(feature._id, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div>
                                  <span className="text-sm text-gray-700 font-medium block">{feature.name}</span>
                                  {feature.description && <span className="text-xs text-gray-500">{feature.description}</span>}
                                </div>
                              </label>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">₹{feature.price}</span>
                              </div>
                            </div>
                          ))
                        )}
                        <div className="pt-3 mt-3 border-t flex justify-between font-semibold">
                          <span className="text-sm text-gray-900">Total Price:</span>
                          <span className="text-sm text-primary-600">₹{calculateCustomTotal()}</span>
                        </div>
                      </div>
                    )}
                    
                    {globalPlans.find(p => p._id === formData.subscriptionPlan) && 
                     globalPlans.find(p => p._id === formData.subscriptionPlan)?.name !== 'Custom' && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Included Features</h4>
                        <div className="space-y-2">
                          {globalPlans.find(p => p._id === formData.subscriptionPlan).features.map(featureId => {
                            const feature = globalFeatures.find(f => f._id === featureId);
                            if (!feature) return null;
                            return (
                              <div key={feature._id} className="flex items-center text-sm text-gray-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {feature.name}
                              </div>
                            );
                          })}
                          {globalPlans.find(p => p._id === formData.subscriptionPlan).features.length === 0 && (
                            <p className="text-sm text-gray-500">No specific features assigned to this plan.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input type="date" name="subscriptionExpiry" value={formData.subscriptionExpiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                  </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-6 -mb-6 border-t">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save Changes
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
