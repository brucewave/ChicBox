'use client';

import React, { useState, ReactNode } from 'react';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiSettings, 
  FiBarChart, 
  FiTruck,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiImage,
  FiGrid
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    router.push('/admin-login');
  };

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/admin', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiPackage, label: 'Products', href: '/admin/add-product', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiShoppingCart, label: 'Orders', href: '/admin/manage-order', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiGrid, label: 'Categories', href: '/admin/manage-category', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    // { icon: FiUsers, label: 'Customers', href: '/admin/customers', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    // { icon: FiTruck, label: 'Shipping', href: '/admin/shipping', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiTag, label: 'Coupons', href: '/admin/manage-coupon', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiImage, label: 'Banners', href: '/admin/manage-banner', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    // { icon: FiBarChart, label: 'Analytics', href: '/admin/analytics', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:bg-green-50', textColor: 'text-green-600' },
    { icon: FiLogOut, label: 'Logout', onClick: handleLogout, color: 'bg-gradient-to-br from-red-500 to-red-600', hover: 'hover:bg-red-50', textColor: 'text-red-600', isLogout: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex">
      {/* Sidebar */}
      <div className={`z-50 w-64 bg-white/80 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out
        fixed inset-y-0 left-0 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-gray-200/50`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-green-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">ChicBox</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              if (item.isLogout) {
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-600 ${item.hover} hover:scale-105`}
                  >
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-3 transition-all duration-300 relative z-10 bg-gray-100 group-hover:bg-red-500`}>
                      <item.icon className="w-5 h-5 text-gray-700 group-hover:text-white" />
                    </span>
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              }
              const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin');
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden
                    ${isActive ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 text-white font-bold shadow-lg transform scale-105' : `text-gray-600 ${item.hover} hover:scale-105`}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 opacity-90 rounded-xl"></div>
                  )}
                  <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-3 transition-all duration-300 relative z-10
                    ${isActive ? 'bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg' : 'bg-gray-100 group-hover:bg-green-500'}`
                  }>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-white'}`} />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0" style={{marginLeft: 0}}>
        {/* Top header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              {/* <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div> */}
              {/* <div className="flex items-center space-x-3">
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                    <FiBell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">3</span>
                  </button>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
              </div> */}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="p-6 flex-1">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-2 text-lg">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 