'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const response = await axios.post(`https://api.roomily.tech/api/v1/auth/login`, {
                usernameOrEmail: email,
                password: password
            })

            const { accessToken, username, userId, role } = response.data

            localStorage.setItem('token', accessToken)
            localStorage.setItem('username', username)
            localStorage.setItem('userId', userId)
            localStorage.setItem('role', role)

            router.push('/') 

        } catch (err: any) {
            const errorMessage = err.response?.data?.message
            if (errorMessage?.toLowerCase().includes('username') || errorMessage?.toLowerCase().includes('email')) {
                toast.error('Tài khoản không tồn tại')
            } else if (errorMessage?.toLowerCase().includes('password')) {
                toast.error('Mật khẩu không chính xác')
            } else {
                toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
            }
        }
    }

    return (
        <>
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
            <TopNavOne props="style-one bg-black" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Đăng Nhập' subHeading='Đăng Nhập' />
            </div>
            <div className="login-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Đăng Nhập</div>
                            <form className="md:mt-7 mt-4" onSubmit={handleLogin}>
                                <div className="email">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        type="text"
                                        placeholder="Tên đăng nhập hoặc email *"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="pass mt-5 relative">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mật khẩu *"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <Icon.EyeSlash size={20} weight="bold" />
                                        ) : (
                                            <Icon.Eye size={20} weight="bold" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <button type="submit" className="button-main bg-black text-white mt-2">Đăng Nhập</button>
                                    <Link href={'/forgot-password'} className='font-semibold hover:underline'>Quên Mật Khẩu?</Link>
                                </div>
                                {error && (
                                    <div className="text-red-500 mt-2">{error}</div>
                                )}
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Khách Hàng Mới</div>
                                <div className="mt-2 text-secondary">Tham gia cùng gia đình đang phát triển của chúng tôi...</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/register'} className="button-main">Đăng Ký</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Login