'use client'

import React from 'react'
import AdminAuthGuard from '../../components/Admin/AdminAuthGuard'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminAuthGuard>
      {children}
    </AdminAuthGuard>
  )
}

export default AdminLayout 