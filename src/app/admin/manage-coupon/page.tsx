'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiCalendar } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { couponService, Coupon } from '../../../services/couponService';

const ManageCouponPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    couponCode: '',
    couponPercentage: '',
    remainingUses: '',
    validFrom: '',
    validUntil: '',
    status: 'ACTIVE'
  });

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons();
      setCoupons(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format dates properly for API (matching the format used in updateCouponUses)
      const formatDateForAPI = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('.')[0]; // Format: YYYY-MM-DDTHH:mm:ss
      };

      const couponData = {
        name: formData.name,
        couponCode: formData.couponCode,
        couponPercentage: parseInt(formData.couponPercentage),
        remainingUses: parseInt(formData.remainingUses),
        validFrom: formatDateForAPI(formData.validFrom),
        validUntil: formatDateForAPI(formData.validUntil),
        status: formData.status as 'ACTIVE' | 'INACTIVE'
      };
      
      console.log('Submitting coupon data:', couponData);
      
      if (editingCoupon) {
        // Update existing coupon
        await couponService.updateCoupon(editingCoupon.id, couponData);
        setSuccess('Coupon updated successfully!');
        setEditingCoupon(null);
      } else {
        // Create new coupon
        await couponService.createCoupon(couponData);
        setSuccess('Coupon created successfully!');
      }
      
      await fetchCoupons(); // Refresh the list
      setShowAddForm(false);
      setFormData({
        name: '',
        couponCode: '',
        couponPercentage: '',
        remainingUses: '',
        validFrom: '',
        validUntil: '',
        status: 'ACTIVE'
      });
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      
      // Get more specific error message
      let errorMessage = editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDeleteCoupon = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(id);
        await fetchCoupons(); // Refresh the list
      } catch (error) {
        console.error('Error deleting coupon:', error);
        setError('Failed to delete coupon');
      }
    }
  };



  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setError(null); // Clear any previous errors
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };
    
    setFormData({
      name: coupon.name,
      couponCode: coupon.couponCode,
      couponPercentage: coupon.couponPercentage.toString(),
      remainingUses: coupon.remainingUses.toString(),
      validFrom: formatDateForInput(coupon.validFrom),
      validUntil: formatDateForInput(coupon.validUntil),
      status: coupon.status
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingCoupon(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      couponCode: '',
      couponPercentage: '',
      remainingUses: '',
      validFrom: '',
      validUntil: '',
      status: 'ACTIVE'
    });
  };

  return (
    <AdminLayout 
      title="Manage Coupons" 
      subtitle="Create and manage discount coupons for your store"
    >
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Coupons</h2>
            <p className="text-gray-600 mt-1">Manage your discount codes and promotions</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setError(null); // Clear any previous errors
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>

        {/* Add/Edit Coupon Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Sale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.couponCode}
                    onChange={(e) => setFormData({...formData, couponCode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., SUMMER20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage *
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-3 text-gray-500">%</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.couponPercentage}
                      onChange={(e) => setFormData({...formData, couponPercentage: e.target.value})}
                      className="w-full pr-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remaining Uses *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.remainingUses}
                    onChange={(e) => setFormData({...formData, remainingUses: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid From *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading coupons...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Coupons Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Remaining Uses</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Valid Period</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{coupon.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{coupon.couponCode}</span>
                          <button
                            onClick={() => copyToClipboard(coupon.couponCode)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            <FiCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{coupon.couponPercentage}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{coupon.remainingUses}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          coupon.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditCoupon(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit coupon"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coupons.filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiEdit className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Remaining Uses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coupons.reduce((sum, c) => sum + c.remainingUses, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCouponPage; 