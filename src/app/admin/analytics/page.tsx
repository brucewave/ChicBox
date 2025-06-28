'use client';

import React from 'react';
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import AdminLayout from '../../../components/Admin/AdminLayout';

const AnalyticsPage = () => {
  // Sample data for various charts
  const monthlyData = [
    { month: 'Jan', sales: 4000, revenue: 2400, profit: 1800, customers: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398, profit: 1200, customers: 2210 },
    { month: 'Mar', sales: 2000, revenue: 9800, profit: 8000, customers: 2290 },
    { month: 'Apr', sales: 2780, revenue: 3908, profit: 3200, customers: 2000 },
    { month: 'May', sales: 1890, revenue: 4800, profit: 4000, customers: 2181 },
    { month: 'Jun', sales: 2390, revenue: 3800, profit: 3000, customers: 2500 },
    { month: 'Jul', sales: 3490, revenue: 4300, profit: 3500, customers: 2100 },
  ];

  const categoryData = [
    { name: 'Electronics', sales: 400, revenue: 2400, color: '#8884d8' },
    { name: 'Fashion', sales: 300, revenue: 1398, color: '#82ca9d' },
    { name: 'Home', sales: 300, revenue: 2210, color: '#ffc658' },
    { name: 'Sports', sales: 200, revenue: 1200, color: '#ff7300' },
    { name: 'Books', sales: 278, revenue: 3908, color: '#8dd1e1' },
    { name: 'Beauty', sales: 189, revenue: 4800, color: '#d084d0' },
  ];

  const radarData = [
    { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
    { subject: 'Marketing', A: 98, B: 130, fullMark: 150 },
    { subject: 'Development', A: 86, B: 130, fullMark: 150 },
    { subject: 'Customer Support', A: 99, B: 100, fullMark: 150 },
    { subject: 'Finance', A: 85, B: 90, fullMark: 150 },
    { subject: 'Operations', A: 65, B: 85, fullMark: 150 },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 1200, revenue: 1440000, growth: '+15%' },
    { name: 'MacBook Air', sales: 980, revenue: 1176000, growth: '+12%' },
    { name: 'AirPods Pro', sales: 850, revenue: 170000, growth: '+8%' },
    { name: 'iPad Air', sales: 720, revenue: 432000, growth: '+20%' },
    { name: 'Apple Watch', sales: 650, revenue: 195000, growth: '+5%' },
  ];

  return (
    <AdminLayout 
      title={<span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">Analytics Dashboard</span>} 
      subtitle={<span className="text-gray-600">Comprehensive insights into your business performance</span>}
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: '$2.4M', change: '+12.5%', color: 'bg-gradient-to-br from-green-500 to-green-600', icon: '💰' },
          { title: 'Total Sales', value: '45.2K', change: '+8.3%', color: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: '📈' },
          { title: 'Avg. Order Value', value: '$89.50', change: '+5.2%', color: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: '🛒' },
          { title: 'Customer Retention', value: '94.2%', change: '+2.1%', color: 'bg-gradient-to-br from-pink-500 to-pink-600', icon: '👥' },
        ].map((metric, index) => (
          <div key={index} className={`rounded-2xl shadow-xl p-6 text-white relative overflow-hidden ${metric.color} transform hover:scale-105 transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{metric.title}</p>
                  <p className="text-3xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className="text-4xl">{metric.icon}</div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-white">{metric.change}</span>
                <span className="text-sm text-white/80 ml-1">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
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
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revenueGradient)" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-2xl shadow-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            Category Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
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
              <Bar dataKey="sales" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Radar */}
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 rounded-2xl shadow-lg p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" stroke="#6B7280" />
              <PolarRadiusAxis stroke="#6B7280" />
              <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Target" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 rounded-2xl shadow-lg p-6 border border-pink-200">
          <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                  ['bg-gradient-to-br from-blue-500 to-blue-600', 'bg-gradient-to-br from-purple-500 to-purple-600', 'bg-gradient-to-br from-green-500 to-green-600', 'bg-gradient-to-br from-pink-500 to-pink-600', 'bg-gradient-to-br from-orange-500 to-orange-600'][index]
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.sales.toLocaleString()} sales • ${product.revenue.toLocaleString()}</p>
                </div>
                <span className="text-sm font-bold text-green-600">{product.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Distribution */}
      <div className="bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-200 rounded-2xl shadow-lg p-6 border border-cyan-200">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
          Sales Distribution by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="sales"
            >
              {categoryData.map((entry, index) => (
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
    </AdminLayout>
  );
};

export default AnalyticsPage; 