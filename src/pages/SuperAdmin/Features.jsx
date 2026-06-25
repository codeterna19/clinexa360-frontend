import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, List } from 'lucide-react';

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data } = await api.get('/features');
      setFeatures(data);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddClick = () => {
    setSelectedFeature(null);
    setFormData({ name: '', description: '', price: 0, isActive: true });
    setShowModal(true);
  };

  const handleEditClick = (feature) => {
    setSelectedFeature(feature);
    setFormData({
      name: feature.name,
      description: feature.description || '',
      price: feature.price,
      isActive: feature.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await api.delete(`/features/${id}`);
        fetchFeatures();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting feature');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFeature) {
        await api.put(`/features/${selectedFeature._id}`, formData);
      } else {
        await api.post('/features', formData);
      }
      setShowModal(false);
      fetchFeatures();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving feature');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Feature Management</h1>
          <p className="text-text-secondary mt-1">Manage global features available for Custom subscription plans</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white h-11 px-6 rounded-full font-medium flex items-center space-x-2 hover:bg-primary-600 transition-all shadow-primary cursor-pointer"
        >
          <Plus size={20} className="mr-1" />
          <span>Add Feature</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-text-secondary">Loading...</div>
      ) : (
        <div className="bg-white rounded-[20px] shadow-subtle border border-border-light overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-border-light text-slate-500 text-xs font-semibold tracking-wide uppercase bg-slate-50/50">
                <th className="p-4">Feature</th>
                <th className="p-4">Description</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {features.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-text-secondary">No features found</td>
                </tr>
              ) : (
                features.map((feature) => (
                  <tr key={feature._id} className="h-[72px] hover:bg-slate-50 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                          <List size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-text-primary">{feature.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary max-w-xs truncate">
                      {feature.description || '-'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                      ₹{feature.price}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xxs font-bold rounded-full border ${
                        feature.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {feature.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity space-x-1 flex justify-end items-center h-[72px]">
                      <button 
                        onClick={() => handleEditClick(feature)}
                        className="p-2 rounded-full transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(feature._id)}
                        className="p-2 rounded-full transition-colors bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
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

      {/* Feature Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-text-primary">
                {selectedFeature ? 'Edit Feature' : 'Add New Feature'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary ml-1">Feature Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" placeholder="e.g. Telemedicine" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary ml-1">Description</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="mt-1.5 block w-full p-4 border border-border-light rounded-[20px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm resize-none" placeholder="Describe the feature..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary ml-1">Base Price (₹)</label>
                    <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} className="mt-1.5 h-11 block w-full px-4 border border-border-light rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" />
                  </div>
                  <div className="flex items-center ml-1 mt-2">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
                    <label className="ml-2 block text-sm font-medium text-text-primary">
                      Active (Available for allocation)
                    </label>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse mt-6 border-t border-border-light -mx-6 -mb-6">
                  <button type="submit" className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2.5 bg-primary font-bold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm cursor-pointer">
                    {selectedFeature ? 'Save Changes' : 'Add Feature'}
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
