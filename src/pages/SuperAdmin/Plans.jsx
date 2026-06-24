import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [globalFeatures, setGlobalFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    features: [],
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, featuresRes] = await Promise.all([
        api.get('/plans'),
        api.get('/features')
      ]);
      setPlans(plansRes.data);
      setGlobalFeatures(featuresRes.data.filter(f => f.isActive));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFeatureChange = (featureId, checked) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, features: [...prev.features, featureId] };
      } else {
        return { ...prev, features: prev.features.filter(id => id !== featureId) };
      }
    });
  };

  const handleAddClick = () => {
    setSelectedPlan(null);
    setFormData({ name: '', price: 0, features: [], isActive: true });
    setShowModal(true);
  };

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      features: plan.features.map(f => f._id || f),
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/plans/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting plan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await api.put(`/plans/${selectedPlan._id}`, formData);
      } else {
        await api.post('/plans', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving plan');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-500">Manage base subscription plans and their included features</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Included Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No plans found</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <Package size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {plan.name === 'Custom' ? '-' : `₹${plan.price}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plan.name === 'Custom' ? 'Dynamic' : plan.features.map(f => f.name).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(plan)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(plan._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g. Basic, Pro, Custom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                    <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} disabled={formData.name.toLowerCase() === 'custom'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100" />
                  </div>
                  
                  {formData.name.toLowerCase() !== 'custom' && (
                    <div className="border rounded-md p-3 bg-gray-50 mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Included Features</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {globalFeatures.map((feature) => (
                          <label key={feature._id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={formData.features.includes(feature._id)}
                              onChange={(e) => handleFeatureChange(feature._id, e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{feature.name} <span className="text-xs text-gray-500">(₹{feature.price})</span></span>
                          </label>
                        ))}
                        {globalFeatures.length === 0 && <span className="text-sm text-gray-500">No active features to select.</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active (Available for allocation)
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-6 -mb-6 border-t">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {selectedPlan ? 'Save Changes' : 'Add Plan'}
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
