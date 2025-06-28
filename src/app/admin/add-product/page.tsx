'use client';

import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiFileText, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProductPage = () => {
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brandName: '',
    productSize: '',
    color: '',
    conditionPoints: '',
    stockQuantity: '',
    isIncluded: false,
    status: 'AVAILABLE',
    discount: '',
    categoryId: '',
    tag: false,
    interest: '',
    lifetime: '',
    capitalPrice: '',
    material: '',
    shoulder: '',
    width: '',
    length: '',
    arm: '',
    form: '',
    fault: '',
    code: '',
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // XLSX Import states
  const [excelData, setExcelData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editAdditionalImages, setEditAdditionalImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Fetch products function
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setErrorProducts(err.response?.data?.message || 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Update search when searchTerm or products change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productSize?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Fetch products on component mount and when pagination/sorting changes
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, sortDir]);

  // Mapping function for XLSX import
  const mapRow = (row: any) => ({
    code: row['Mã'],
    tag: row['Tag'] === 'TRUE',
    material: row['Chất vải'],
    productSize: row['Size'],
    shoulder: row['Vai'],
    width: row['Rộng'],
    length: row['Dài'],
    arm: row['Tay'],
    conditionPoints: row['Cond'],
    sex: row['Sex'],
    form: row['Type'],
    price: row['Giá bán'],
    fault: row['Lỗi'],
    primaryImageUrl: row['Ảnh'],
    createdAt: row['Ngày đăng'],
    updatedAt: row['Ngày chốt'],
    isIncluded: row['Đã đăng'] === 'TRUE',
    isSold: row['Đã bán'] === 'TRUE',
    isWholesale: row['Đã sỉ'] === 'TRUE',
    color: row['Màu'],
    discount: row['Discount (%)'],
    fitType: row['Fit type'],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If removing the first image, update primary image
    if (index === 0 && additionalImages.length > 1) {
      setPrimaryImage(additionalImages[1]);
    } else if (index === 0) {
      setPrimaryImage(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrimaryImage(file);
      
      // Create preview for the first image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews([e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Set the first image as primary image
      setPrimaryImage(files[0]);
      
      // Set all images as additional images
      setAdditionalImages(files);
      
      // Create previews for all images
      const previews: string[] = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target?.result as string;
          if (index === files.length - 1) {
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryImage) {
      toast.error('Please select a primary image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value.toString());
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });
      
      // Add primary image
      formDataToSend.append('primaryImage', primaryImage);
      
      // Add additional images
      additionalImages.forEach((image, index) => {
        formDataToSend.append('additionalImages', image);
      });
      
      console.log('Form data being sent:', Object.fromEntries(formDataToSend.entries()));
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Product created:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        brandName: '',
        productSize: '',
        color: '',
        conditionPoints: '',
        stockQuantity: '',
        isIncluded: false,
        status: 'AVAILABLE',
        discount: '',
        categoryId: '',
        tag: false,
        interest: '',
        lifetime: '',
        capitalPrice: '',
        material: '',
        shoulder: '',
        width: '',
        length: '',
        arm: '',
        form: '',
        fault: '',
        code: '',
      });
      setPrimaryImage(null);
      setAdditionalImages([]);
      setImagePreviews([]);
      
      toast.success('Product created successfully!');
      
      // Refresh products list
      fetchProducts();
      
    } catch (err: any) {
      console.error('Create error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(`Failed to create product: ${err.response?.data?.message || err.message}`);
    }
  };

  // XLSX Import functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Excel data:', jsonData);
        setExcelData(jsonData);
        setShowPreview(true);
        setImportError('');
        toast.success(`Successfully loaded ${jsonData.length} rows from Excel file`);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Failed to read Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (excelData.length === 0) {
      toast.error('Please upload an Excel file first');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      const token = localStorage.getItem('token');
      const mappedData = excelData.map(mapRow);
      
      console.log('Mapped data for import:', mappedData);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/bulk`, mappedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Import response:', response.data);
      toast.success(`Successfully imported ${mappedData.length} products!`);
      
      // Reset import state
      setExcelData([]);
      setShowPreview(false);
      
      // Refresh products list
      fetchProducts();
      
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err.response?.data?.message || 'Failed to import products');
      toast.error(`Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Product Name',
        description: 'Product Description',
        price: 0.00,
        brandName: 'Brand Name',
        categoryName: 'Category',
        stockQuantity: 1,
        status: 'AVAILABLE',
        material: 'MATERIAL',
        color: 'Color',
        productSize: 'Size',
        conditionPoints: 10,
        discount: 0.00,
        capitalPrice: 0.00,
        interest: 0.00,
        lifetime: 12.0,
        form: 'CLASSIC_FIT',
        fault: 'No faults',
        shoulder: 0.0,
        width: 0.0,
        length: 0.0,
        arm: 0.0
      }
    ];

    try {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products Template');
      XLSX.writeFile(wb, 'products_template.xlsx');
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

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
      console.log('Selected files for edit:', files.map(f => f.name));
      
      // Set the first image as primary image
      setEditImage(files[0]);
      
      // Set all images as additional images (including the first one for processing)
      setEditAdditionalImages(files);
      
      // Create previews for all images
      const previews: string[] = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target?.result as string;
          if (index === files.length - 1) {
            console.log('Created previews for edit:', previews.length);
            setEditImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEditImage = (index: number) => {
    console.log('Removing image at index:', index);
    console.log('Current additional images:', editAdditionalImages.length);
    
    const newAdditionalImages = editAdditionalImages.filter((_, i) => i !== index);
    const newImagePreviews = editImagePreviews.filter((_, i) => i !== index);
    
    setEditAdditionalImages(newAdditionalImages);
    setEditImagePreviews(newImagePreviews);
    
    // If removing the first image, update primary image
    if (index === 0 && newAdditionalImages.length > 0) {
      console.log('Updating primary image to:', newAdditionalImages[0].name);
      setEditImage(newAdditionalImages[0]);
    } else if (index === 0) {
      console.log('No images left, clearing primary image');
      setEditImage(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      
      // Add all the form fields with the correct API field names
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
      
      // Add the image file if a new one is selected
      if (editImage) {
        form.append('primaryImage', editImage);
        console.log('✅ Added primary image:', editImage.name, 'Size:', editImage.size, 'Type:', editImage.type);
      }
      
      // Add additional images (try different field names the backend might expect)
      editAdditionalImages.slice(1).forEach((image, index) => {
        // Try multiple field names that the backend might expect
        form.append(`additionalImages`, image);
        form.append(`images`, image);
        form.append(`imageFiles`, image);
        console.log(`✅ Added additional image ${index + 1}:`, image.name, 'Size:', image.size, 'Type:', image.type);
      });
      
      console.log('📊 Image Summary:');
      console.log('- Primary image:', editImage?.name || 'None');
      console.log('- Additional images count:', editAdditionalImages.slice(1).length);
      console.log('- Total images to send:', editAdditionalImages.length);
      console.log('- editImage exists:', !!editImage);
      console.log('- editAdditionalImages length:', editAdditionalImages.length);
      
      console.log('🔍 FormData contents:');
      Array.from(form.entries()).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`  ${key}:`, value.name, 'Size:', value.size, 'Type:', value.type);
        } else {
          console.log(`  ${key}:`, value);
        }
      });
      
      console.log('📤 Sending request to:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${editProduct.id}`);
      console.log('📋 Request headers:', { Authorization: `Bearer ${token}` });
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${editProduct.id}`, form, {
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let axios set it automatically for FormData
        },
      });
      
      console.log('✅ Server response received:');
      console.log('- Status:', response.status);
      console.log('- Response data:', response.data);
      console.log('- Response headers:', response.headers);
      
      if (response.data.primaryImageUrl) {
        console.log('✅ Primary image URL returned:', response.data.primaryImageUrl);
      }
      if (response.data.imageUrls) {
        console.log('✅ Additional image URLs returned:', response.data.imageUrls);
      }
      
      // Update the local state immediately with the updated product data
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === editProduct.id 
            ? { 
                ...product, 
                ...editForm,
                // Update the image URL if a new image was uploaded
                primaryImageUrl: editImage ? response.data.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
              }
            : product
        )
      );
      
      // Also update filtered products if we're currently searching
      if (searchTerm) {
        setFilteredProducts(prevFiltered => 
          prevFiltered.map(product => 
            product.id === editProduct.id 
              ? { 
                  ...product, 
                  ...editForm,
                  // Update the image URL if a new image was uploaded
                  primaryImageUrl: editImage ? response.data.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
                }
              : product
          )
        );
      }
      
      toast.success('Product updated successfully!');
      closeEditModal();
    } catch (err: any) {
      console.error('Update error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(`Failed to update product: ${err.response?.data?.message || err.message}`);
    }
  };

  // Separate function to handle status updates
  const handleStatusUpdate = async (productId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Updating status for product ${productId} to ${newStatus}`);
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productId}/status?status=${newStatus}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Status update response:', response.data);
      
      // Update the local state immediately
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: newStatus }
            : product
        )
      );
      
      // Also update filtered products if we're currently searching
      if (searchTerm) {
        setFilteredProducts(prevFiltered => 
          prevFiltered.map(product => 
            product.id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
      }
      
      // Update the edit form if we're editing this product
      if (editProduct && editProduct.id === productId) {
        setEditForm((prev: any) => ({ ...prev, status: newStatus }));
      }
      
      toast.success(`Product status updated to ${newStatus}`);
      
    } catch (err: any) {
      console.error('Status update error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  // Function to open delete confirmation modal
  const openDeleteModal = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Function to handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from local state
      setProducts(products.filter(p => p.id !== productToDelete.id));
      if (searchTerm) {
        setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      }
      
      toast.success('Product deleted successfully!');
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(`Failed to delete product: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <AdminLayout 
      title="Add Product" 
      subtitle="Create a new product for your store"
    >
      {/* Product List Section (moved above form) */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Products</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1">
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
            <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="border rounded px-2 py-1">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products by name, brand, category, color, or size..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        {loadingProducts ? (
          <div className="text-center py-8">Loading products...</div>
        ) : errorProducts ? (
          <div className="text-center text-red-500 py-8">{errorProducts}</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        {product.primaryImageUrl ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${product.primaryImageUrl}`} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.brandName}</td>
                      <td className="px-4 py-3">{product.categoryName}</td>
                      <td className="px-4 py-3">${product.price}</td>
                      <td className="px-4 py-3">{product.stockQuantity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{product.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(product)}
                            type="button"
                            title="Edit product"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => openDeleteModal(product)}
                            type="button"
                            title="Delete product"
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
                <div className="text-center py-8 text-gray-500">No products found.</div>
              )}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* XLSX Import Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Import Products from Excel</h3>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="excel-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload Excel file
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">XLSX, XLS files only</p>
              </div>
            </div>

            {importError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {importError}
              </div>
            )}

            {showPreview && excelData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-4">Preview ({excelData.length} products)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(excelData[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {excelData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">Showing first 5 rows of {excelData.length} total</p>
                  )}
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : `Import ${excelData.length} Products`}
                  </button>
                  <button
                    onClick={() => {
                      setExcelData([]);
                      setShowPreview(false);
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Form Section */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} required rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                <input type="text" name="brandName" value={formData.brandName} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Size *</label>
                <input type="text" name="productSize" value={formData.productSize} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <input type="text" name="color" value={formData.color} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition Points *</label>
                <input type="number" name="conditionPoints" value={formData.conditionPoints} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" name="isIncluded" checked={formData.isIncluded} onChange={handleFormChange} className="mr-2" />
                <label className="text-sm font-medium text-gray-700">Is Included</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select name="status" value={formData.status} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category ID *</label>
                <input type="number" name="categoryId" value={formData.categoryId} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" name="tag" checked={formData.tag} onChange={handleFormChange} className="mr-2" />
                <label className="text-sm font-medium text-gray-700">Tag</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest</label>
                <input type="number" name="interest" value={formData.interest} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lifetime</label>
                <input type="number" name="lifetime" value={formData.lifetime} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capital Price</label>
                <input type="number" name="capitalPrice" value={formData.capitalPrice} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                <select name="material" value={formData.material} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Select Material</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Shoulder</label>
                <input type="number" name="shoulder" value={formData.shoulder} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <input type="number" name="width" value={formData.width} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <input type="number" name="length" value={formData.length} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arm</label>
                <input type="number" name="arm" value={formData.arm} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
                <input type="text" name="form" value={formData.form} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fault</label>
                <input type="text" name="fault" value={formData.fault} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleMultipleImagesChange} 
                  className="w-full" 
                />
                <p className="text-sm text-gray-500 mt-1">First image will be used as thumbnail. You can upload multiple images.</p>
              </div>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Previews</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Product image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
            <div className="flex justify-end space-x-4 mt-6">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Publish Product</button>
            </div>
          </div>
        </form>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
              <h2 className="text-xl font-bold">Edit Product</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input type="text" name="name" value={editForm.name || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input type="number" name="price" value={editForm.price || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea name="description" value={editForm.description || ''} onChange={handleEditFormChange} required rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                    <input type="text" name="brandName" value={editForm.brandName || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Size *</label>
                    <input type="text" name="productSize" value={editForm.productSize || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                    <input type="text" name="color" value={editForm.color || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition Points *</label>
                    <input type="number" name="conditionPoints" value={editForm.conditionPoints || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input type="number" name="stockQuantity" value={editForm.stockQuantity || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="isIncluded" checked={!!editForm.isIncluded} onChange={handleEditFormChange} className="mr-2" />
                    <label className="text-sm font-medium text-gray-700">Is Included</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select 
                      name="status" 
                      value={editForm.status || 'AVAILABLE'} 
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setEditForm((prev: any) => ({ ...prev, status: newStatus }));
                        // Call the status update API immediately
                        if (editProduct) {
                          handleStatusUpdate(editProduct.id, newStatus);
                        }
                      }} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input type="number" name="discount" value={editForm.discount || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category ID *</label>
                    <input type="number" name="categoryId" value={editForm.categoryId || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" name="tag" checked={!!editForm.tag} onChange={handleEditFormChange} className="mr-2" />
                    <label className="text-sm font-medium text-gray-700">Tag</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest</label>
                    <input type="number" name="interest" value={editForm.interest || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lifetime</label>
                    <input type="number" name="lifetime" value={editForm.lifetime || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capital Price</label>
                    <input type="number" name="capitalPrice" value={editForm.capitalPrice || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                    <select name="material" value={editForm.material || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option value="">Select Material</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shoulder</label>
                    <input type="number" name="shoulder" value={editForm.shoulder || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <input type="number" name="width" value={editForm.width || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                    <input type="number" name="length" value={editForm.length || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arm</label>
                    <input type="number" name="arm" value={editForm.arm || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
                    <input type="text" name="form" value={editForm.form || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fault</label>
                    <input type="text" name="fault" value={editForm.fault || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                    <input type="text" name="code" value={editForm.code || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleEditMultipleImagesChange} 
                      className="w-full mb-2" 
                    />
                    <p className="text-sm text-gray-500 mb-2">First image will be used as thumbnail. You can upload multiple images.</p>
                    
                    {/* Current Images */}
                    {editProduct?.imageUrls && editProduct.imageUrls.length > 0 && editImagePreviews.length === 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editProduct.imageUrls.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/images/${imageUrl}`} 
                                alt={`Current product image ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
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
                    
                    {/* New Image Previews */}
                    {editImagePreviews.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">New Image Previews:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`New product image ${index + 1}`} 
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
              </form>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={closeEditModal} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleEditSubmit} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>? This will permanently remove the product from your store.
              </p>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-6 py-2 bg-red text-white rounded-lg border-2 border-red-700 font-bold shadow-md hover:bg-red-700 hover:border-red-800 transition-colors"
                >
                  Delete Product
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

export default AddProductPage;