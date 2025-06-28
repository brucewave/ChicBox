import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 px-8 text-center mt-auto">
      &copy; {new Date().getFullYear()} ChicBox Admin. All rights reserved.
    </footer>
  );
};

export default AdminFooter; 