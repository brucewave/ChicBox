'use client';
import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { productService } from '../../../services/productService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllProductPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editAdditionalImages, setEditAdditionalImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Fetch products function
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts('');
    try {
      console.log('Fetching products with:', { page, pageSize, sortBy, sortDir });
      const response = await productService.getProducts(page, pageSize, sortBy, sortDir);
      console.log('Products response:', response);
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 1);
      console.log('Products loaded:', response.content?.length || 0);
      if (response.content && response.content.length > 0) {
        console.log('First product sample:', response.content[0]);
        console.log('Product properties:', Object.keys(response.content[0]));
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setErrorProducts(err.message || 'Không thể tải sản phẩm');
      toast.error('Không thể tải sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Search all products function
  const searchAllProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      console.log('Searching all products for:', searchQuery);
      // Try to get all products with a large page size
      const response = await fetch('https://api.roomily.tech/api/v1/products?page=0&size=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log('Search API response status:', response.status);
      console.log('Search API response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Search API response data:', responseData);
      console.log('Response data type:', typeof responseData);
      
      // Handle both array and paginated response formats
      let allProducts: any[] = [];
      
      if (Array.isArray(responseData)) {
        // Direct array response
        allProducts = responseData;
        console.log('Direct array response, products count:', allProducts.length);
      } else if (responseData && responseData.content && Array.isArray(responseData.content)) {
        // Paginated response format
        allProducts = responseData.content;
        console.log('Paginated response, products count:', allProducts.length);
      } else {
        console.error('Unexpected response format:', responseData);
        throw new Error('API returned unexpected data format');
      }
      
      // Filter products based on search term
      const filtered = allProducts.filter((product: any) => {
        const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const descriptionMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const brandMatch = product.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
        const colorMatch = product.color?.toLowerCase().includes(searchQuery.toLowerCase());
        const sizeMatch = product.productSize?.toLowerCase().includes(searchQuery.toLowerCase());
        const materialMatch = product.material?.toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatch = product.status?.toLowerCase().includes(searchQuery.toLowerCase());
        const codeMatch = product.code?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const isMatch = nameMatch || descriptionMatch || brandMatch || colorMatch || sizeMatch || materialMatch || statusMatch || codeMatch;
        
        if (isMatch) {
          console.log('Product matched:', product.name, 'by term:', searchQuery);
        }
        
        return isMatch;
      });
      
      setFilteredProducts(filtered);
      console.log('Search results:', filtered.length, 'products found across all products');
    } catch (err: any) {
      console.error('Search error:', err);
      toast.error('Lỗi tìm kiếm sản phẩm');
      
      // Fallback to local search on current page
      console.log('Falling back to local search on current page products');
      const filtered = products.filter((product: any) => {
        const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const descriptionMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const brandMatch = product.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
        const colorMatch = product.color?.toLowerCase().includes(searchQuery.toLowerCase());
        const sizeMatch = product.productSize?.toLowerCase().includes(searchQuery.toLowerCase());
        const materialMatch = product.material?.toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatch = product.status?.toLowerCase().includes(searchQuery.toLowerCase());
        const codeMatch = product.code?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return nameMatch || descriptionMatch || colorMatch || sizeMatch || materialMatch || statusMatch || codeMatch;
      });
      
      setFilteredProducts(filtered);
      console.log('Fallback search results:', filtered.length, 'products found on current page');
    } finally {
      setSearching(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('Component mounted, fetching products...');
    fetchProducts();
  }, []);

  // Set initial filteredProducts when products are first loaded
  useEffect(() => {
    if (products.length > 0) {
      console.log('Setting initial filteredProducts:', products.length);
      setFilteredProducts(products);
    }
  }, [products]);

  // Fetch products when page, sortBy, or sortDir change
  useEffect(() => {
    if (page > 0 || sortBy !== 'createdAt' || sortDir !== 'desc') {
      console.log('Fetching products with:', { page, pageSize, sortBy, sortDir });
      fetchProducts();
    }
  }, [page, sortBy, sortDir]);

  // Set filteredProducts to products when products change
  useEffect(() => {
    console.log('Products changed, updating filteredProducts:', products.length);
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    console.log('Search effect triggered:', { searchTerm, productsCount: products.length });
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (!searchTerm.trim()) {
      // When no search term, show current page products only
      setFilteredProducts(products);
      setSearching(false);
      console.log('No search term, showing current page products:', products.length);
    } else {
      // Show searching state immediately but don't disable input
      // const timeout = setTimeout(() => {
      //   setSearching(true);
      //   searchAllProducts(searchTerm);
      // }, 500); // Wait 500ms after user stops typing
      
      // Debounce the actual search but don't block input
      const timeout = setTimeout(() => {
        searchAllProducts(searchTerm);
      }, 300); // Reduced to 300ms for better responsiveness
      
      setSearchTimeout(timeout);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, products]); // Add products as dependency

  // Edit modal logic
  const openEditModal = (product: any) => {
    setEditProduct(product);
    setEditForm({ ...product });
    setEditImage(null);
    setEditImagePreview(null);
    setEditAdditionalImages([]);
    setEditImagePreviews([]);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditProduct(null);
    setEditForm({});
    setEditImage(null);
    setEditImagePreview(null);
    setEditAdditionalImages([]);
    setEditImagePreviews([]);
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setEditForm((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEditForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };
  const handleEditMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setEditImage(files[0]);
      setEditAdditionalImages(files);
      const previews: string[] = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target?.result as string;
          if (index === files.length - 1) {
            setEditImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const removeEditImage = (index: number) => {
    const newAdditionalImages = editAdditionalImages.filter((_, i) => i !== index);
    const newImagePreviews = editImagePreviews.filter((_, i) => i !== index);
    setEditAdditionalImages(newAdditionalImages);
    setEditImagePreviews(newImagePreviews);
    if (index === 0 && newAdditionalImages.length > 0) {
      setEditImage(newAdditionalImages[0]);
    } else if (index === 0) {
      setEditImage(null);
    }
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      const form = new FormData();
      form.append('name', editForm.name || '');
      form.append('description', editForm.description || '');
      form.append('price', editForm.price?.toString() || '');
      form.append('brandName', editForm.brandName || '');
      form.append('productSize', editForm.productSize || '');
      form.append('color', editForm.color || '');
      form.append('conditionPoints', editForm.conditionPoints?.toString() || '');
      form.append('stockQuantity', editForm.stockQuantity?.toString() || '');
      form.append('isIncluded', editForm.isIncluded?.toString() || 'false');
      form.append('status', editForm.status || 'AVAILABLE');
      form.append('discount', editForm.discount?.toString() || '');
      form.append('categoryId', editForm.categoryId?.toString() || '');
      form.append('tag', editForm.tag?.toString() || 'false');
      form.append('interest', editForm.interest?.toString() || '');
      form.append('lifetime', editForm.lifetime?.toString() || '');
      form.append('capitalPrice', editForm.capitalPrice?.toString() || '');
      form.append('material', editForm.material || '');
      form.append('shoulder', editForm.shoulder?.toString() || '');
      form.append('width', editForm.width?.toString() || '');
      form.append('length', editForm.length?.toString() || '');
      form.append('arm', editForm.arm?.toString() || '');
      form.append('form', editForm.form || '');
      form.append('fault', editForm.fault || '');
      form.append('code', editForm.code || '');
      // Chỉ thêm ảnh nếu thực sự có ảnh mới được chọn
      const allImages = [editImage, ...editAdditionalImages].filter(Boolean) as File[];
      if (allImages.length > 0) {
        allImages.forEach((image, index) => {
          form.append('images', image);
        });
      }
      const response = await productService.updateProduct(editProduct.id, form);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === editProduct.id 
            ? { 
                ...product, 
                ...editForm,
                primaryImageUrl: editImage ? response.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
              }
            : product
        )
      );
      if (searchTerm) {
        setFilteredProducts(prevFiltered => 
          prevFiltered.map(product => 
            product.id === editProduct.id 
              ? { 
                  ...product, 
                  ...editForm,
                  primaryImageUrl: editImage ? response.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
                }
              : product
          )
        );
      }
      toast.success('Cập nhật sản phẩm thành công!');
      closeEditModal();
    } catch (err: any) {
      toast.error(`Cập nhật sản phẩm thất bại: ${err.message}`);
    }
  };
  // Status update
  const handleStatusUpdate = async (productId: number, newStatus: string) => {
    try {
      const response = await productService.updateProductStatus(productId, newStatus);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: newStatus }
            : product
        )
      );
      if (searchTerm) {
        setFilteredProducts(prevFiltered => 
          prevFiltered.map(product => 
            product.id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
      }
      if (editProduct && editProduct.id === productId) {
        setEditForm((prev: any) => ({ ...prev, status: newStatus }));
      }
      toast.success('Đã cập nhật trạng thái sản phẩm!');
    } catch (err: any) {
      toast.error(`Cập nhật trạng thái thất bại: ${err.message}`);
    }
  };
  // Delete modal logic
  const openDeleteModal = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      if (searchTerm) {
        setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      }
      toast.success('Đã xoá sản phẩm thành công!');
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast.error(`Xoá sản phẩm thất bại: ${err.message}`);
    }
  };

  return (
    <AdminLayout title={<span>Sản phẩm</span>}>
      <ToastContainer />
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tất cả sản phẩm</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 mr-2">Sắp xếp:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1">
              <option value="createdAt">Ngày tạo</option>
              <option value="updatedAt">Ngày cập nhật</option>
              <option value="price">Giá</option>
              <option value="name">Tên</option>
            </select>
            <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="border rounded px-2 py-1">
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <div className="relative max-w-md">
                         <input
               type="text"
               placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu, danh mục, màu sắc, size..."
               value={searchTerm}
               onChange={(e) => {
                 console.log('Search input changed:', e.target.value);
                 setSearchTerm(e.target.value);
               }}
                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {searching ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
                     {searchTerm && (
             <div className="mt-2">
               {searching ? (
                 <p className="text-sm text-blue-600">
                   🔍 Đang tìm kiếm trong tất cả sản phẩm...
                 </p>
               ) : (
                 <p className="text-sm text-gray-600">
                   Tìm thấy {filteredProducts.length} sản phẩm phù hợp với "{searchTerm}"
                 </p>
               )}
             </div>
           )}
        </div>
        {loadingProducts ? (
          <div className="text-center py-8">Đang tải sản phẩm...</div>
        ) : errorProducts ? (
          <div className="text-center text-red-500 py-8">{errorProducts}</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        {product.primaryImageUrl ? (
                          <img src={`https://api.roomily.tech/api/v1/images/${product.primaryImageUrl}`} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.brandName}</td>
                      <td className="px-4 py-3">{product.categoryName}</td>
                      <td className="px-4 py-3">{Math.round(product.price).toLocaleString('vi-VN')} VNĐ</td>
                      <td className="px-4 py-3">{product.stockQuantity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{product.status === 'AVAILABLE' ? 'Đang bán' : 'Ẩn'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(product)}
                            type="button"
                            title="Sửa sản phẩm"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => openDeleteModal(product)}
                            type="button"
                            title="Xoá sản phẩm"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">Không có sản phẩm nào.</div>
              )}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-gray-700">Trang {page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Tiếp
              </button>
            </div>
          </>
        )}
      </div>
      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
              <h2 className="text-xl font-bold">Sửa sản phẩm</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
                    <input type="text" name="name" value={editForm.name || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
                    <input type="number" name="price" value={editForm.price || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
                    <textarea name="description" value={editForm.description || ''} onChange={handleEditFormChange} required rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
                    <input type="text" name="brandName" value={editForm.brandName || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                    <input type="text" name="productSize" value={editForm.productSize || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc *</label>
                    <input type="text" name="color" value={editForm.color || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Điểm chất lượng *</label>
                    <input type="number" name="conditionPoints" value={editForm.conditionPoints || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho *</label>
                    <input type="number" name="stockQuantity" value={editForm.stockQuantity || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="isIncluded" checked={!!editForm.isIncluded} onChange={handleEditFormChange} className="mr-2" />
                    <label className="text-sm font-medium text-gray-700">Quà tặng kèm</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                    <select 
                      name="status" 
                      value={editForm.status || 'AVAILABLE'} 
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setEditForm((prev: any) => ({ ...prev, status: newStatus }));
                        if (editProduct) {
                          handleStatusUpdate(editProduct.id, newStatus);
                        }
                      }} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="AVAILABLE">Đang bán</option>
                      <option value="INACTIVE">Ẩn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm giá (%)</label>
                    <input type="number" name="discount" value={editForm.discount || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID danh mục *</label>
                    <input type="number" name="categoryId" value={editForm.categoryId || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="tag" checked={!!editForm.tag} onChange={handleEditFormChange} className="mr-2" />
                    <label className="text-sm font-medium text-gray-700">Tag</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lãi suất</label>
                    <input type="number" name="interest" value={editForm.interest || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tuổi thọ</label>
                    <input type="number" name="lifetime" value={editForm.lifetime || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá vốn</label>
                    <input type="number" name="capitalPrice" value={editForm.capitalPrice || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu *</label>
                    <select name="material" value={editForm.material || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option value="">Chọn chất liệu</option>
                      <option value="COTTON">COTTON</option>
                      <option value="OXFORD">OXFORD</option>
                      <option value="KAKI">KAKI</option>
                      <option value="LINEN">LINEN</option>
                      <option value="DENIM">DENIM</option>
                      <option value="CHAMBRAY">CHAMBRAY</option>
                      <option value="POPLIN">POPLIN</option>
                      <option value="SEERSUCKER">SEERSUCKER</option>
                      <option value="FLANNEL">FLANNEL</option>
                      <option value="NHUNG">NHUNG</option>
                      <option value="THUN">THUN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai</label>
                    <input type="number" name="shoulder" value={editForm.shoulder || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rộng</label>
                    <input type="number" name="width" value={editForm.width || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dài</label>
                    <input type="number" name="length" value={editForm.length || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tay</label>
                    <input type="number" name="arm" value={editForm.arm || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
                    <input type="text" name="form" value={editForm.form || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lỗi</label>
                    <input type="text" name="fault" value={editForm.fault || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã sản phẩm</label>
                    <input type="text" name="code" value={editForm.code || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleEditMultipleImagesChange} 
                      className="w-full mb-2" 
                    />
                    <p className="text-sm text-gray-500 mb-2">Ảnh đầu tiên sẽ là thumbnail. Có thể tải lên nhiều ảnh.</p>
                    {/* Current Images */}
                    {editProduct?.imageUrls && editProduct.imageUrls.length > 0 && editImagePreviews.length === 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editProduct.imageUrls.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={`https://api.roomily.tech/api/v1/images/${imageUrl}`} 
                                alt={`Ảnh sản phẩm ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* New Previews */}
                    {editImagePreviews.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh mới:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`Ảnh sản phẩm mới ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Thumbnail
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Lưu thay đổi</button>
                  <button type="button" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" onClick={closeEditModal}>Huỷ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Xác nhận xoá sản phẩm</h3>
            <p>Bạn có chắc chắn muốn xoá sản phẩm này không?</p>
            <div className="flex gap-4 mt-6 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setDeleteModalOpen(false)}>Huỷ</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleDeleteProduct}>Xoá</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllProductPage; 