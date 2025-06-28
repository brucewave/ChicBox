'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const role = localStorage.getItem('role')
        
        if (token && role === 'ADMIN') {
            router.push('/admin')
        }
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
                usernameOrEmail: email,
                password: password
            })

            const { accessToken, username, userId, role } = response.data

            if (role !== 'ROLE_ADMIN') {
                toast.error('Access denied. Admin privileges required.')
                setIsLoading(false)
                return
            }

            localStorage.setItem('token', accessToken)
            localStorage.setItem('username', username)
            localStorage.setItem('userId', userId)
            localStorage.setItem('role', role)

            toast.success('Login successful!')
            router.push('/admin')

        } catch (err: any) {
            const errorMessage = err.response?.data?.message
            if (errorMessage?.toLowerCase().includes('username') || errorMessage?.toLowerCase().includes('email')) {
                toast.error('Tài khoản không tồn tại')
            } else if (errorMessage?.toLowerCase().includes('password')) {
                toast.error('Mật khẩu không chính xác')
            } else {
                toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">C</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ChicBox Admin
                    </h1>
                    <p className="text-gray-600 mt-2">Sign in to your admin account</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Username or Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                                    type="text"
                                    placeholder="Enter your username or email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Icon.User size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-300 pr-12"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <Icon.EyeSlash size={20} className="text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Icon.Eye size={20} className="text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Need help? Contact your system administrator
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-500">
                        <Icon.ShieldCheck size={16} className="mr-2" />
                        Secure admin access
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin 