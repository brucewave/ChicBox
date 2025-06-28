import React from 'react';

const AdminHeader = () => {
  return (
    <header className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow">
      <div className="text-2xl font-bold">Admin Panel</div>
      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold">Logout</button>
    </header>
  );
};

export default AdminHeader; 