'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { categoryService, Category } from '../../../services/categoryService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageCategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    category: Category | null;
    saving: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    category: null,
    saving: false
  });
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    deleting: boolean;
  }>({
    isOpen: false,
    category: null,
    deleting: false
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Fetch categories error:', err);
      setError(err.message || 'Failed to fetch categories');
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModal({
      isOpen: true,
      mode: 'create',
      category: null,
      saving: false
    });
    setFormData({
      name: '',
      description: ''
    });
  };

  const openEditModal = (category: Category) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      category,
      saving: false
    });
    setFormData({
      name: category.name,
      description: category.description
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      mode: 'create',
      category: null,
      saving: false
    });
  };

  const openDeleteModal = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      category,
      deleting: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      category: null,
      deleting: false
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setModal(prev => ({ ...prev, saving: true }));
      
      if (modal.mode === 'create') {
        const newCategory = await categoryService.createCategory(formData);
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully!');
      } else {
        const updatedCategory = await categoryService.updateCategory(modal.category!.id, formData);
        setCategories(prev => prev.map(cat => 
          cat.id === modal.category!.id ? updatedCategory : cat
        ));
        toast.success('Category updated successfully!');
      }
      
      closeModal();
    } catch (err: any) {
      console.error('Save category error:', err);
      const errorMessage = err.message || 'Failed to save category';
      toast.error(errorMessage);
      
      // If it's a JSON parsing error, provide more specific feedback
      if (err.message.includes('JSON') || err.message.includes('Unexpected end')) {
        toast.error('Server response format issue. Please try again or contact support.');
      }
    } finally {
      setModal(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleteModal(prev => ({ ...prev, deleting: true }));
      await categoryService.deleteCategory(deleteModal.category.id);
      
      setCategories(prev => prev.filter(cat => cat.id !== deleteModal.category!.id));
      toast.success('Category deleted successfully!');
      closeDeleteModal();
    } catch (err: any) {
      console.error('Delete category error:', err);
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout 
        title="Manage Categories" 
        subtitle="Create and manage product categories"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading categories...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Manage Categories" 
      subtitle="Create and manage product categories"
    >
      <div className="space-y-6">
        {/* Header with Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button 
              onClick={openCreateModal}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{category.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(category)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                {category.createdAt && (
                  <div>Created: {formatDate(category.createdAt)}</div>
                )}
                {category.updatedAt && (
                  <div>Updated: {formatDate(category.updatedAt)}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiSearch className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first category'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modal.mode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modal.saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modal.saving || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modal.saving ? 'Saving...' : (modal.mode === 'create' ? 'Create Category' : 'Update Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.category && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{deleteModal.category.name}"</strong>? 
                This will permanently remove the category from your system.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteModal.deleting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteModal.deleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteModal.deleting ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AdminLayout>
  );
};

export default ManageCategoryPage; 