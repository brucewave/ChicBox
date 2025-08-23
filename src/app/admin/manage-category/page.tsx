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
      setError(err.message || 'Không thể tải danh mục');
      toast.error('Không thể tải danh mục');
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

  const openToggleStatusModal = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      category,
      deleting: false
    });
  };

  const closeToggleStatusModal = () => {
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
      toast.error('Tên danh mục là bắt buộc');
      return;
    }

    try {
      setModal(prev => ({ ...prev, saving: true }));
      
      if (modal.mode === 'create') {
        const newCategory = await categoryService.createCategory(formData);
        setCategories(prev => [...prev, newCategory]);
        toast.success('Tạo danh mục thành công!');
      } else {
        const updatedCategory = await categoryService.updateCategory(modal.category!.id, formData);
        setCategories(prev => prev.map(cat => 
          cat.id === modal.category!.id ? updatedCategory : cat
        ));
        toast.success('Cập nhật danh mục thành công!');
      }
      
      closeModal();
    } catch (err: any) {
      console.error('Save category error:', err);
      const errorMessage = err.message || 'Không thể lưu danh mục';
      toast.error(errorMessage);
      
      // If it's a JSON parsing error, provide more specific feedback
      if (err.message.includes('JSON') || err.message.includes('Unexpected end')) {
        toast.error('Lỗi định dạng phản hồi từ server. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      }
    } finally {
      setModal(prev => ({ ...prev, saving: false }));
    }
  };

  const handleToggleStatus = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleteModal(prev => ({ ...prev, deleting: true }));
      
      // Toggle trạng thái hoạt động
      const newStatus = !deleteModal.category.isActive;
      const updatedCategory = await categoryService.updateCategory(deleteModal.category.id, {
        name: deleteModal.category.name,
        description: deleteModal.category.description,
        isActive: newStatus
      });
      
      // Cập nhật danh sách categories
      setCategories(prev => prev.map(cat => 
        cat.id === deleteModal.category!.id ? updatedCategory : cat
      ));
      
      const statusText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
      toast.success(`Đã ${statusText} danh mục "${deleteModal.category.name}" thành công!`);
      closeToggleStatusModal();
    } catch (err: any) {
      console.error('Toggle status error:', err);
      toast.error(err.message || 'Không thể thay đổi trạng thái danh mục');
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
        title="Quản lý danh mục" 
        subtitle="Tạo và quản lý danh mục sản phẩm"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải danh mục...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Quản lý danh mục" 
      subtitle="Tạo và quản lý danh mục sản phẩm"
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
                  placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
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
              Thêm danh mục
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
                    title="Chỉnh sửa danh mục"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openToggleStatusModal(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isActive 
                        ? 'text-orange-600 hover:bg-orange-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={category.isActive ? 'Vô hiệu hóa danh mục' : 'Kích hoạt danh mục'}
                  >
                    {category.isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                {category.createdAt && (
                  <div>Tạo lúc: {formatDate(category.createdAt)}</div>
                )}
                {category.updatedAt && (
                  <div>Cập nhật: {formatDate(category.updatedAt)}</div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy danh mục</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Thử điều chỉnh từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách tạo danh mục đầu tiên'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo danh mục đầu tiên
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
                {modal.mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
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
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mô tả danh mục"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modal.saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modal.saving || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modal.saving ? 'Đang lưu...' : (modal.mode === 'create' ? 'Tạo danh mục' : 'Cập nhật danh mục')}
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
                  {deleteModal.category?.isActive ? (
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {deleteModal.category?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} danh mục
                  </h3>
                  <p className="text-sm text-gray-500">
                    {deleteModal.category?.isActive 
                      ? 'Danh mục sẽ không còn hiển thị trong hệ thống' 
                      : 'Danh mục sẽ được kích hoạt và hiển thị trở lại'
                    }
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn {deleteModal.category?.isActive ? 'vô hiệu hóa' : 'kích hoạt'} danh mục <strong>"{deleteModal.category?.name}"</strong>? 
                {deleteModal.category?.isActive 
                  ? 'Danh mục sẽ không còn hiển thị trong hệ thống.' 
                  : 'Danh mục sẽ được kích hoạt và hiển thị trở lại.'
                }
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeToggleStatusModal}
                  disabled={deleteModal.deleting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={deleteModal.deleting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    deleteModal.category?.isActive 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {deleteModal.deleting 
                    ? 'Đang xử lý...' 
                    : (deleteModal.category?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt')
                  }
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