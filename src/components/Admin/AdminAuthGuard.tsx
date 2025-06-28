'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthGuardProps {
    children: React.ReactNode
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token')
            const role = localStorage.getItem('role')
            
            if (!token || role !== 'ROLE_ADMIN') {
                setIsLoading(false)
                router.push('/admin-login')
                return
            }
            
            setIsAuthenticated(true)
            setIsLoading(false)
        }

        checkAuth()
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">C</span>
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

export default AdminAuthGuard 