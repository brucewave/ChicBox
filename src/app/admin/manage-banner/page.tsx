'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, FiUpload, FiX } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  position: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const ManageBannerPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    banner: Banner | null;
    saving: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    banner: null,
    saving: false
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    status: 'DRAFT' as Banner['status'],
    position: 1,
    startDate: '',
    endDate: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockBanners: Banner[] = [
      {
        id: 1,
        title: 'Summer Collection 2025',
        description: 'Discover our latest summer fashion collection with up to 50% off',
        imageUrl: '/images/banner/1.png',
        linkUrl: '/shop/summer-collection',
        status: 'ACTIVE',
        position: 1,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        title: 'New Arrivals',
        description: 'Check out the newest arrivals in our store',
        imageUrl: '/images/banner/2.png',
        linkUrl: '/shop/new-arrivals',
        status: 'ACTIVE',
        position: 2,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 3,
        title: 'Flash Sale',
        description: 'Limited time offer - 70% off selected items',
        imageUrl: '/images/banner/3.png',
        linkUrl: '/shop/flash-sale',
        status: 'INACTIVE',
        position: 3,
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    setTimeout(() => {
      setBanners(mockBanners);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || banner.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setModal({
      isOpen: true,
      mode: 'create',
      banner: null,
      saving: false
    });
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      status: 'DRAFT',
      position: 1,
      startDate: '',
      endDate: ''
    });
  };

  const openEditModal = (banner: Banner) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      banner,
      saving: false
    });
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      status: banner.status,
      position: banner.position,
      startDate: banner.startDate,
      endDate: banner.endDate
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      mode: 'create',
      banner: null,
      saving: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get the URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBanner = async () => {
    try {
      setModal(prev => ({ ...prev, saving: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (modal.mode === 'create') {
        const newBanner: Banner = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setBanners(prev => [...prev, newBanner]);
      } else {
        setBanners(prev => prev.map(banner => 
          banner.id === modal.banner?.id 
            ? { ...banner, ...formData, updatedAt: new Date().toISOString() }
            : banner
        ));
      }
      
      closeModal();
    } catch (err) {
      setError('Failed to save banner');
    } finally {
      setModal(prev => ({ ...prev, saving: false }));
    }
  };

  const deleteBanner = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setBanners(prev => prev.filter(banner => banner.id !== id));
      } catch (err) {
        setError('Failed to delete banner');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Manage Banners" 
        subtitle="Create and manage banner advertisements"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading banners...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Manage Banners" 
      subtitle="Create and manage banner advertisements"
    >
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search banners by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
              <button 
                onClick={openCreateModal}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Banner
              </button>
            </div>
          </div>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/other/404-img.png';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(banner.status)}`}>
                    {banner.status.charAt(0).toUpperCase() + banner.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-black bg-opacity-50 text-white text-sm font-bold rounded-full">
                    {banner.position}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{banner.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{banner.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="text-gray-900">{formatDate(banner.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">End Date:</span>
                    <span className="text-gray-900">{formatDate(banner.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Link:</span>
                    <span className="text-blue-600 truncate">{banner.linkUrl}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Updated: {formatDate(banner.updatedAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openEditModal(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Banner"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBanner(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Banner"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBanners.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiEye className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first banner'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Banner
              </button>
            )}
          </div>
        )}
      </div>

      {/* Banner Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modal.mode === 'create' ? 'Create New Banner' : 'Edit Banner'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter banner title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="number"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter banner description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  disabled={modal.saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBanner}
                  disabled={!formData.title || !formData.imageUrl || modal.saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modal.saving ? 'Saving...' : (modal.mode === 'create' ? 'Create Banner' : 'Update Banner')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageBannerPage; 