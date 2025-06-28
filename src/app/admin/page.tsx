'use client';

import React from 'react';
import { FiShoppingCart, FiTrendingUp, FiUsers, FiPackage, FiDollarSign, FiEye, FiHeart, FiStar } from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import AdminLayout from '../../components/Admin/AdminLayout';
import StatCard from '../../components/Admin/StatCard';

const AdminPage = () => {
  // Sample data for charts
  const salesData = [
    { name: 'Jan', sales: 4000, orders: 2400, customers: 2400 },
    { name: 'Feb', sales: 3000, orders: 1398, customers: 2210 },
    { name: 'Mar', sales: 2000, orders: 9800, customers: 2290 },
    { name: 'Apr', sales: 2780, orders: 3908, customers: 2000 },
    { name: 'May', sales: 1890, orders: 4800, customers: 2181 },
    { name: 'Jun', sales: 2390, orders: 3800, customers: 2500 },
    { name: 'Jul', sales: 3490, orders: 4300, customers: 2100 },
  ];

  const pieData = [
    { name: 'Electronics', value: 400, color: '#8884d8' },
    { name: 'Fashion', value: 300, color: '#82ca9d' },
    { name: 'Home', value: 300, color: '#ffc658' },
    { name: 'Sports', value: 200, color: '#ff7300' },
  ];

  const stats = [
    { 
      title: 'Total Sales', 
      value: '$45,231', 
      change: '+20.1%', 
      positive: true, 
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700', 
      icon: <FiTrendingUp className="w-8 h-8 text-white" />,
      bgPattern: 'bg-gradient-to-br from-blue-400/20 to-blue-600/20'
    },
    { 
      title: 'Orders', 
      value: '2,350', 
      change: '+180.1%', 
      positive: true, 
      color: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700', 
      icon: <FiShoppingCart className="w-8 h-8 text-white" />,
      bgPattern: 'bg-gradient-to-br from-emerald-400/20 to-emerald-600/20'
    },
    { 
      title: 'Products', 
      value: '1,234', 
      change: '+19%', 
      positive: true, 
      color: 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700', 
      icon: <FiPackage className="w-8 h-8 text-white" />,
      bgPattern: 'bg-gradient-to-br from-pink-400/20 to-pink-600/20'
    },
    { 
      title: 'Customers', 
      value: '573', 
      change: '+201', 
      positive: true, 
      color: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700', 
      icon: <FiUsers className="w-8 h-8 text-white" />,
      bgPattern: 'bg-gradient-to-br from-amber-400/20 to-amber-600/20'
    },
  ];

  const additionalStats = [
    { 
      title: 'Revenue', 
      value: '$12,345', 
      change: '+15.3%', 
      positive: true, 
      color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700', 
      icon: <FiDollarSign className="w-6 h-6 text-white" />,
      bgPattern: 'bg-gradient-to-br from-purple-400/20 to-purple-600/20'
    },
    { 
      title: 'Views', 
      value: '45.2K', 
      change: '+8.7%', 
      positive: true, 
      color: 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700', 
      icon: <FiEye className="w-6 h-6 text-white" />,
      bgPattern: 'bg-gradient-to-br from-cyan-400/20 to-cyan-600/20'
    },
    { 
      title: 'Likes', 
      value: '2.1K', 
      change: '+12.4%', 
      positive: true, 
      color: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700', 
      icon: <FiHeart className="w-6 h-6 text-white" />,
      bgPattern: 'bg-gradient-to-br from-rose-400/20 to-rose-600/20'
    },
    { 
      title: 'Rating', 
      value: '4.8', 
      change: '+0.2', 
      positive: true, 
      color: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700', 
      icon: <FiStar className="w-6 h-6 text-white" />,
      bgPattern: 'bg-gradient-to-br from-indigo-400/20 to-indigo-600/20'
    },
  ];

  const statusColors = {
    completed: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    processing: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    shipped: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  const statGradients = [
    'bg-gradient-to-br from-green-500 via-emerald-500 to-green-700',
    'bg-gradient-to-br from-emerald-600 to-emerald-800',
    'bg-gradient-to-br from-pink-500 to-pink-700',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
  ];
  const additionalStatGradients = [
    'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-800',
    'bg-gradient-to-br from-cyan-500 to-cyan-700',
    'bg-gradient-to-br from-rose-500 to-rose-700',
    'bg-gradient-to-br from-indigo-500 to-indigo-700',
  ];

  return (
    <AdminLayout 
      title={<span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">Dashboard</span>} 
      subtitle={<span className="text-gray-600">Welcome back! Here's what's happening with your store today.</span>}
    >
      {/* Main Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={index === 0 ? '' : stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            gradient={statGradients[index % statGradients.length]}
          />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {additionalStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            gradient={additionalStatGradients[index % additionalStatGradients.length]}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Sales Analytics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="url(#salesGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="orders" stroke="#10B981" fill="url(#ordersGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-2xl shadow-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 rounded-2xl shadow-lg p-6 border border-emerald-200 mb-8">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
          Monthly Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="customers" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Recent Orders
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item, i) => (
              <div key={item} className="flex items-center space-x-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['bg-gradient-to-br from-blue-500 to-blue-600','bg-gradient-to-br from-emerald-500 to-emerald-600','bg-gradient-to-br from-pink-500 to-pink-600','bg-gradient-to-br from-amber-500 to-amber-600'][i]}`}>
                  <FiShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Order #{1000 + item}</p>
                  <p className="text-sm text-gray-600">$299.00 • 2 items</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors.completed}`}>Completed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 rounded-2xl shadow-lg p-6 border border-pink-200">
          <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            Top Products
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item, i) => (
              <div key={item} className="flex items-center space-x-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className={`w-10 h-10 rounded-lg ${['bg-gradient-to-br from-pink-500 to-pink-600','bg-gradient-to-br from-blue-500 to-blue-600','bg-gradient-to-br from-emerald-500 to-emerald-600','bg-gradient-to-br from-amber-500 to-amber-600'][i]}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Product {item}</p>
                  <p className="text-sm text-gray-600">{100 + item * 10} sales</p>
                </div>
                <span className={`text-sm font-medium ${['text-pink-600','text-blue-600','text-emerald-600','text-amber-600'][i]}`}>${(item * 25 + 50).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage; 