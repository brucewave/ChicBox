'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiDownload, FiX } from 'react-icons/fi';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { orderService } from '../../../services/orderService';
import { Order, OrderResponse } from '../../../type/OrderType';

const ManageOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    lastPage: true,
    firstPage: true
  });
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    order: Order | null;
    newStatus: string;
    updating: boolean;
  }>({
    isOpen: false,
    order: null,
    newStatus: '',
    updating: false
  });

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalOrders: orders.length,
      totalItems: orders.reduce((sum, order) => sum + order.orderItems.length, 0),
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      statusCounts: {
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        REFUNDED: 0,
        DUPLICATE: 0
      }
    };

    orders.forEach(order => {
      const status = order.status.toUpperCase();
      if (stats.statusCounts[status as keyof typeof stats.statusCounts] !== undefined) {
        stats.statusCounts[status as keyof typeof stats.statusCounts]++;
      }
    });

    return stats;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response: OrderResponse = await orderService.getOrders(page, 10, 'createdAt', 'desc');
      setOrders(response.content);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        lastPage: response.lastPage,
        firstPage: response.firstPage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      case 'DUPLICATE':
        return 'bg-gray-100 text-gray-800';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const getAvailableStatuses = (currentStatus: string) => {
    // All possible statuses that can be selected
    const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'DUPLICATE'];
    
    // Remove the current status from the list (can't select the same status)
    return allStatuses.filter(status => status !== currentStatus.toUpperCase());
  };

  const getRecommendedStatuses = (currentStatus: string) => {
    const recommendedFlow = {
      'PENDING': ['CONFIRMED', 'CANCELLED', 'DUPLICATE'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED', 'DUPLICATE'],
      'PROCESSING': ['CONFIRMED', 'DELIVERED', 'CANCELLED', 'DUPLICATE'],
      'DELIVERED': ['REFUNDED'],
      'CANCELLED': [],
      'REFUNDED': [],
      'DUPLICATE': []
    };
    return recommendedFlow[currentStatus.toUpperCase() as keyof typeof recommendedFlow] || [];
  };

  const openStatusModal = (order: Order) => {
    setStatusModal({
      isOpen: true,
      order,
      newStatus: '',
      updating: false
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      order: null,
      newStatus: '',
      updating: false
    });
  };

  const updateOrderStatus = async () => {
    if (!statusModal.order || !statusModal.newStatus) return;

    try {
      setStatusModal(prev => ({ ...prev, updating: true }));
      await orderService.updateOrderStatus(statusModal.order.id, statusModal.newStatus);
      
      // Refresh the orders list
      await fetchOrders(pagination.pageNumber);
      closeStatusModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setStatusModal(prev => ({ ...prev, updating: false }));
    }
  };

  const exportOrders = () => {
    // Prepare data for export
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.orderNumber,
      'Customer Name': order.fullName,
      'Customer Username': order.customerUsername,
      'Phone Number': order.phoneNumber,
      'Status': order.status,
      'Total Amount': formatCurrency(order.totalAmount),
      'Items Count': order.orderItems.length,
      'Order Date': formatDate(order.createdAt),
      'Shipping Address': order.shippingAddress,
      'Notes': order.notes || 'N/A'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Manage Orders" 
        subtitle="View and manage all customer orders"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        title="Manage Orders" 
        subtitle="View and manage all customer orders"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Manage Orders" 
      subtitle="View and manage all customer orders"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{calculateStats().totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{calculateStats().totalItems}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateStats().totalAmount)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateStats().statusCounts.PENDING + calculateStats().statusCounts.CONFIRMED + calculateStats().statusCounts.PROCESSING}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(calculateStats().statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status)}`}>
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{status.charAt(0) + status.slice(1).toLowerCase()}</p>
                <p className="text-xs text-gray-500">{count} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, or name..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="duplicate">Duplicate</option>
              </select>
              <button 
                onClick={exportOrders}
                disabled={filteredOrders.length === 0}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.fullName}</div>
                        <div className="text-sm text-gray-500">{order.customerUsername}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{order.orderItems.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(order)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.pageNumber * pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalElements}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.firstPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.pageNumber + 1} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.lastPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiSearch className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiFilter className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiEdit className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">1,166</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiEye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Status Update Modal */}
      {statusModal.isOpen && statusModal.order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h3>
              <button
                onClick={closeStatusModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Order: <span className="font-medium">{statusModal.order.orderNumber}</span></p>
                <p className="text-sm text-gray-600 mb-2">Customer: <span className="font-medium">{statusModal.order.fullName}</span></p>
                <p className="text-sm text-gray-600">Current Status: 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(statusModal.order.status)}`}>
                    {statusModal.order.status.charAt(0).toUpperCase() + statusModal.order.status.slice(1).toLowerCase()}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select new status</option>
                  {statusModal.order && getAvailableStatuses(statusModal.order.status).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {statusModal.order && getAvailableStatuses(statusModal.order.status).length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No status changes available for this order
                  </p>
                )}
                {statusModal.newStatus === 'DELIVERED' && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Note:</strong> Marking as delivered will award loyalty points to the customer. 
                      Ensure the customer has a valid loyalty account.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeStatusModal}
                  disabled={statusModal.updating}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateOrderStatus}
                  disabled={!statusModal.newStatus || statusModal.updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusModal.updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageOrderPage; 