'use client';

import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiFileText, FiDownload, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { productService } from '../../../services/productService';

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
    isIncluded: true,
    status: 'AVAILABLE',
    discount: '0.00',
    categoryId: '',
    tag: true,
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

  // Categories for dropdown
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories function
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('https://api.roomily.tech/api/v1/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const categoriesData = await response.json();
      setCategories(categoriesData);
      console.log('Categories loaded:', categoriesData);
    } catch (err: any) {
      console.error('Fetch categories error:', err);
      toast.error('Không thể tải danh mục sản phẩm');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch products function
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts('');
    try {
      const response = await productService.getProducts(page, pageSize, sortBy, sortDir);
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setErrorProducts(err.message || 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

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
    // Remove from additional images (index is 0-based for additional images)
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index + 1)); // +1 because index 0 is primary image
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

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Set the first image as primary image
      setPrimaryImage(files[0]);
      
      // Set remaining images as additional images (skip the first one)
      setAdditionalImages(files.slice(1));
      
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
      toast.error('Vui lòng chọn ảnh đại diện');
      return;
    }
    // Validation categoryId bắt buộc
    if (!formData.categoryId) {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }
    // Validation conditionPoints <= 10
    if (Number(formData.conditionPoints) > 10) {
      toast.error('Điểm chất lượng không được vượt quá 10');
      return;
    }
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Step 1: Create product with primary image
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== '' && value !== null && value !== undefined) {
          if (['price', 'stockQuantity', 'discount', 'categoryId', 'interest', 'lifetime', 'capitalPrice', 'conditionPoints', 'shoulder', 'width', 'length', 'arm'].includes(key)) {
            const num = Number(value);
            if (!isNaN(num)) {
              formDataToSend.append(key, num.toString());
            }
          } else if (['isIncluded', 'tag'].includes(key)) {
            formDataToSend.append(key, value ? 'true' : 'false');
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });
      
      // Debug: Log what's being sent
      console.log('Form data before sending:', formData);
      console.log('FormData entries:');
      formDataToSend.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      // Ensure required fields have default values if empty
      if (!formData.discount || formData.discount === '') {
        formDataToSend.append('discount', '0.00');
      }
      if (!formData.interest || formData.interest === '') {
        formDataToSend.append('interest', '0.00');
      }
      if (!formData.lifetime || formData.lifetime === '') {
        formDataToSend.append('lifetime', '12.0');
      }
      if (!formData.capitalPrice || formData.capitalPrice === '') {
        formDataToSend.append('capitalPrice', '0.00');
      }
      if (!formData.shoulder || formData.shoulder === '') {
        formDataToSend.append('shoulder', '0.0');
      }
      if (!formData.width || formData.width === '') {
        formDataToSend.append('width', '0.0');
      }
      if (!formData.length || formData.length === '') {
        formDataToSend.append('length', '0.0');
      }
      if (!formData.arm || formData.arm === '') {
        formDataToSend.append('arm', '0.0');
      }
      
      // Ensure form field is always sent (required by API)
      if (!formData.form || formData.form === '') {
        formDataToSend.append('form', 'CLASSIC_FIT'); // Default value
      }
      
      // Add primary image
      formDataToSend.append('primaryImage', primaryImage);
      
      console.log('Creating product with data:');
      formDataToSend.forEach((value, key) => {
        console.log(key, value);
      });
      
      const createRes = await fetch(`https://api.roomily.tech/api/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể tạo sản phẩm');
      }
      
      // Get product ID from response
      const responseText = await createRes.text();
      console.log('Response text:', responseText);
      let productId = null;
      
      if (responseText && responseText.trim()) {
        try {
          const createdProduct = JSON.parse(responseText);
          console.log('Parsed response:', createdProduct);
          productId = createdProduct.id || createdProduct.productId || createdProduct.data?.id || createdProduct.product?.id;
        } catch (e) {
          console.log('Failed to parse JSON response:', e);
        }
      }
      
      // Try to get product ID from Location header if not in response body
      if (!productId) {
        const locationHeader = createRes.headers.get('Location');
        console.log('Location header:', locationHeader);
        if (locationHeader) {
          const match = locationHeader.match(/\/products\/(\d+)/);
          if (match) {
            productId = match[1];
          }
        }
      }
      
      // If still no product ID, try to get it from the response headers
      if (!productId) {
        const productIdHeader = createRes.headers.get('X-Product-ID') || createRes.headers.get('Product-ID');
        if (productIdHeader) {
          productId = productIdHeader;
        }
      }
      
      if (!productId) {
        console.log('Product created successfully (201), but no ID in response. Trying to find the product...');
        
        // Try to get the product ID by fetching the latest products and finding the one we just created
        try {
          const listRes = await fetch(`https://api.roomily.tech/api/v1/products?size=10&sort=createdAt,desc`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (listRes.ok) {
            const listData = await listRes.json();
            const products = listData.content || [];
            console.log('Latest products:', products);
            
            // Find the product we just created by matching name, brandName, and price
            const newProduct = products.find((p: any) => 
              p.name === formData.name && 
              p.brandName === formData.brandName && 
              p.price === Number(formData.price)
            );
            
            if (newProduct) {
              productId = newProduct.id;
              console.log('Found product ID from list:', productId);
            } else {
              console.log('Could not find the created product in the list');
            }
          }
        } catch (e) {
          console.log('Failed to get product ID from list:', e);
        }
      }
      
      // If we have a product ID, proceed with additional images
      if (productId) {
        console.log('Product created successfully with ID:', productId);
        
        // Step 2: Upload additional images if any
        if (additionalImages.length > 0) {
          console.log('Uploading additional images...');
          
          const additionalFormData = new FormData();
          additionalImages.forEach((image, index) => {
            additionalFormData.append('images', image);
          });
          
          const additionalUploadRes = await fetch(`https://api.roomily.tech/api/v1/products/${productId}/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: additionalFormData
          });
          
          if (!additionalUploadRes.ok) {
            console.warn('Failed to upload additional images, but product was created successfully');
          } else {
            console.log('Additional images uploaded successfully');
          }
        }
      } else {
        console.log('Product created successfully, but no ID returned. This is normal for some APIs.');
      }
      
      toast.success('Đăng sản phẩm thành công!');
      
      // Reset form
      setFormData({
        name: '', description: '', price: '', brandName: '', productSize: '', color: '', conditionPoints: '', stockQuantity: '', isIncluded: true, status: 'AVAILABLE', discount: '0.00', categoryId: '', tag: true, interest: '0.00', lifetime: '12.0', capitalPrice: '0.00', material: '', shoulder: '0.0', width: '0.0', length: '0.0', arm: '0.0', form: '', fault: '', code: ''
      });
      setPrimaryImage(null);
      setAdditionalImages([]);
      setImagePreviews([]);
      
    } catch (err: any) {
      console.error('Create error:', err);
      toast.error(`Không thể đăng sản phẩm: ${err.message}`);
    }
  };

  // XLSX Import functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Vui lòng tải lên file Excel (.xlsx hoặc .xls)');
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
        toast.success(`Đã tải lên thành công ${jsonData.length} dòng từ file Excel`);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (excelData.length === 0) {
      toast.error('Vui lòng tải lên file Excel trước');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      const token = localStorage.getItem('token');
      const mappedData = excelData.map(mapRow);
      
      console.log('Mapped data for import:', mappedData);
      
      const response = await axios.post(`https://api.roomily.tech/api/v1/products/bulk`, mappedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Import response:', response.data);
      toast.success(`Đã nhập thành công ${mappedData.length} sản phẩm!`);
      
      // Reset import state
      setExcelData([]);
      setShowPreview(false);
      
      // Refresh products list
      fetchProducts();
      
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err.response?.data?.message || 'Failed to import products');
      toast.error(`Nhập không thành công: ${err.response?.data?.message || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Tên sản phẩm',
        description: 'Mô tả sản phẩm',
        price: 0.00,
        brandName: 'Thương hiệu',
        categoryName: 'Danh mục',
        stockQuantity: 1,
        status: 'ĐANG BÁN',
        material: 'CHẤT LIỆU',
        color: 'MÀU SẮC',
        productSize: 'SIZE',
        conditionPoints: 10,
        discount: 0.00,
        capitalPrice: 0.00,
        interest: 0.00,
        lifetime: 12.0,
        form: 'CLASSIC_FIT',
        fault: 'Không lỗi',
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
      toast.success('Mẫu tải về thành công!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Không thể tải mẫu');
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
      const form = new FormData();
      
      // Add all the form fields
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
      
      // Add all images (primary + additional) as a single array
      const allImages = [editImage, ...editAdditionalImages].filter(Boolean) as File[];
      allImages.forEach((image, index) => {
        form.append('images', image);
      });
      
      console.log('📊 Image Summary:');
      console.log('- Total images to send:', allImages.length);
      console.log('- Images:', allImages.map(img => img.name));
      
      const response = await productService.updateProduct(editProduct.id, form);
      
      console.log('✅ Product updated:', response);
      
      // Update the local state immediately with the updated product data
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === editProduct.id 
            ? { 
                ...product, 
                ...editForm,
                // Update the image URL if a new image was uploaded
                primaryImageUrl: editImage ? response.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
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
                  primaryImageUrl: editImage ? response.primaryImageUrl || product.primaryImageUrl : product.primaryImageUrl
                }
              : product
          )
        );
      }
      
      toast.success('Đã cập nhật sản phẩm thành công!');
      closeEditModal();
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(`Không thể cập nhật sản phẩm: ${err.message}`);
    }
  };

  // Separate function to handle status updates
  const handleStatusUpdate = async (productId: number, newStatus: string) => {
    try {
      console.log(`Updating status for product ${productId} to ${newStatus}`);
      
      const response = await productService.updateProductStatus(productId, newStatus);
      
      console.log('Status update response:', response);
      
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
      
      toast.success(`Trạng thái sản phẩm đã được cập nhật thành ${newStatus}`);
      
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(`Không thể cập nhật trạng thái: ${err.message}`);
    }
  };



  const openDeleteModal = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Function to handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await productService.deleteProduct(productToDelete.id);
      
      // Remove from local state
      setProducts(products.filter(p => p.id !== productToDelete.id));
      if (searchTerm) {
        setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      }
      
      toast.success('Đã xóa sản phẩm thành công!');
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(`Không thể xóa sản phẩm: ${err.message}`);
    }
  };

  return (
    <AdminLayout 
      title="Thêm Sản Phẩm" 
      subtitle="Tạo sản phẩm mới cho cửa hàng của bạn"
    >
      {/* Ẩn danh sách All Product, chỉ giữ lại form thêm sản phẩm */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập tên sản phẩm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
                <input type="number" name="price" value={formData.price} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập giá" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} required rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập mô tả sản phẩm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
                <input type="text" name="brandName" value={formData.brandName} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập thương hiệu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước *</label>
                <input type="text" name="productSize" value={formData.productSize} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập kích thước (S, M, L, XL...)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc *</label>
                <input type="text" name="color" value={formData.color} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập màu sắc" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điểm chất lượng (1-10) *</label>
                <input type="number" name="conditionPoints" value={formData.conditionPoints} onChange={handleFormChange} required min="1" max="10" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập điểm chất lượng từ 1-10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng tồn kho *</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleFormChange} required min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập số lượng tồn kho" />
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" name="isIncluded" checked={formData.isIncluded} onChange={handleFormChange} className="mr-2" />
                <label className="text-sm font-medium text-gray-700">Quà tặng kèm</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái sản phẩm *</label>
                <select name="status" value={formData.status} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="AVAILABLE">Đang bán</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm giảm giá (%)</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleFormChange} min="0" max="100" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập % giảm giá (0-100)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục sản phẩm *</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Chọn danh mục sản phẩm</option>
                  {loadingCategories ? (
                    <option disabled>Đang tải danh mục...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} {!category.isActive && '(Không hoạt động)'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" name="tag" checked={formData.tag} onChange={handleFormChange} className="mr-2" />
                <label className="text-sm font-medium text-gray-700">Gắn tag đặc biệt</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tỷ lệ lãi suất (%)</label>
                <input type="number" name="interest" value={formData.interest} onChange={handleFormChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập tỷ lệ lãi suất" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bảo hành (tháng)</label>
                <input type="number" name="lifetime" value={formData.lifetime} onChange={handleFormChange} min="0" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập thời gian bảo hành" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá nhập hàng (VNĐ)</label>
                <input type="number" name="capitalPrice" value={formData.capitalPrice} onChange={handleFormChange} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập giá nhập hàng (VNĐ)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu vải *</label>
                <select name="material" value={formData.material} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Chọn chất liệu vải</option>
                  <option value="COTTON">Cotton (Vải cotton)</option>
                  <option value="OXFORD">Oxford (Vải oxford)</option>
                  <option value="KAKI">Kaki (Vải kaki)</option>
                  <option value="LINEN">Linen (Vải lanh)</option>
                  <option value="DENIM">Denim (Vải jean)</option>
                  <option value="CHAMBRAY">Chambray (Vải chambray)</option>
                  <option value="POPLIN">Poplin (Vải poplin)</option>
                  <option value="SEERSUCKER">Seersucker (Vải seersucker)</option>
                  <option value="FLANNEL">Flannel (Vải flannel)</option>
                  <option value="NHUNG">Nhung (Vải nhung)</option>
                  <option value="THUN">Thun (Vải thun)</option>
                </select>
              </div>
              {/* Form áo dạng dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu dáng áo</label>
                <select name="form" value={formData.form} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Chọn kiểu dáng áo</option>
                  <option value="SLIM_FIT">Slim Fit (Ôm sát)</option>
                  <option value="CUSTOM_FIT">Custom Fit (Vừa vặn)</option>
                  <option value="CLASSIC_FIT">Classic Fit (Cổ điển)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả lỗi sản phẩm</label>
                <input type="text" name="fault" value={formData.fault} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Mô tả lỗi sản phẩm (nếu có)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã định danh sản phẩm</label>
                <input type="text" name="code" value={formData.code} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập mã định danh sản phẩm" />
              </div>
              {/* Missing fields from Postman request */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai áo (cm)</label>
                <input type="number" step="0.1" name="shoulder" value={formData.shoulder} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập kích thước vai áo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chiều rộng áo (cm)</label>
                <input type="number" step="0.1" name="width" value={formData.width} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập chiều rộng áo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chiều dài áo (cm)</label>
                <input type="number" step="0.1" name="length" value={formData.length} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập chiều dài áo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chiều dài tay áo (cm)</label>
                <input type="number" step="0.1" name="arm" value={formData.arm} onChange={handleFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập chiều dài tay áo" />
              </div>
              {/* Ảnh sản phẩm */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm *</label>
                <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="w-full" />
                <p className="text-sm text-gray-500 mt-1">Chọn một hoặc nhiều ảnh. Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện chính.</p>
                
                {/* Show all image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={index === 0 ? "Ảnh đại diện" : `Ảnh bổ sung ${index}`} 
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Ảnh chính
                          </div>
                        )}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeImage(index - 1)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa ảnh này"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Tạo sản phẩm mới</button>
            </div>
          </div>
        </form>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
              <h2 className="text-xl font-bold">Chỉnh sửa sản phẩm</h2>
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
                        // Call the status update API immediately
                        if (editProduct) {
                          handleStatusUpdate(editProduct.id, newStatus);
                        }
                      }} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="AVAILABLE">ĐANG BÁN</option>
                      <option value="INACTIVE">ẨN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm giá (%)</label>
                    <input type="number" name="discount" value={editForm.discount || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục sản phẩm</label>
                    <select name="categoryId" value={editForm.categoryId || ''} onChange={handleEditFormChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option value="">Chọn danh mục sản phẩm</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} {!category.isActive && '(Không hoạt động)'}
                        </option>
                      ))}
                    </select>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Form áo</label>
                    <select name="form" value={editForm.form || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option value="">Chọn form áo</option>
                      <option value="SLIM_FIT">SLIM_FIT</option>
                      <option value="CUSTOM_FIT">CUSTOM_FIT</option>
                      <option value="CLASSIC_FIT">CLASSIC_FIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lỗi</label>
                    <input type="text" name="fault" value={editForm.fault || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã sản phẩm</label>
                    <input type="text" name="code" value={editForm.code || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  {/* Missing fields from Postman request */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai (cm)</label>
                    <input type="number" step="0.1" name="shoulder" value={editForm.shoulder || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rộng (cm)</label>
                    <input type="number" step="0.1" name="width" value={editForm.width || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dài (cm)</label>
                    <input type="number" step="0.1" name="length" value={editForm.length || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tay (cm)</label>
                    <input type="number" step="0.1" name="arm" value={editForm.arm || ''} onChange={handleEditFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
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
                    <p className="text-sm text-gray-500 mb-2">Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện. Bạn có thể tải lên nhiều ảnh.</p>
                    
                    {/* Current Images */}
                    {editProduct?.imageUrls && editProduct.imageUrls.length > 0 && editImagePreviews.length === 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editProduct.imageUrls.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={`https://api.roomily.tech/api/v1/images/${imageUrl}`} 
                                alt={`Ảnh sản phẩm hiện tại ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Image Previews */}
                    {editImagePreviews.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh dự kiến:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`Ảnh sản phẩm dự kiến ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
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
                <button type="button" onClick={closeEditModal} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
                <button type="button" onClick={handleEditSubmit} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Lưu thay đổi</button>
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
                  <h3 className="text-lg font-medium text-gray-900">Xóa sản phẩm</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa <strong>"{productToDelete?.name}"</strong>? Điều này sẽ xóa sản phẩm vĩnh viễn khỏi cửa hàng của bạn.
              </p>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-6 py-2 bg-red text-white rounded-lg border-2 border-red-700 font-bold shadow-md hover:bg-red-700 hover:border-red-800 transition-colors"
                >
                  Xóa sản phẩm
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