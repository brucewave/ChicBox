'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface FormData {
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    agreeToTerms: boolean;
}

interface FormErrors {
    username?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    agreeToTerms?: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
        status?: number;
    };
}

const Register = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        agreeToTerms: false
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        
        if (!formData.username) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        if (!formData.firstName) newErrors.firstName = 'Vui lòng nhập tên';
        if (!formData.lastName) newErrors.lastName = 'Vui lòng nhập họ';
        if (!formData.email) newErrors.email = 'Vui lòng nhập email';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            });

            toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            router.push('/login');
        } catch (error: unknown) {
            const apiError = error as ApiError;
            if (apiError.response?.data?.message) {
                // Handle specific field errors
                const errorMessage = apiError.response.data.message;
                if (errorMessage.includes('username')) {
                    setErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã tồn tại' }));
                } else if (errorMessage.includes('email')) {
                    setErrors(prev => ({ ...prev, email: 'Email đã tồn tại' }));
                } else if (errorMessage.includes('phone')) {
                    setErrors(prev => ({ ...prev, phoneNumber: 'Số điện thoại đã tồn tại' }));
                } else {
                    toast.error(errorMessage);
                }
            } else if (apiError.response?.status === 409) {
                toast.error('Tên đăng nhập, email hoặc số điện thoại đã tồn tại');
            } else {
                toast.error('Đăng ký thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Create An Account' subHeading='Create An Account' />
            </div>
            <div className="register-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Register</div>
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="email">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.username ? 'border-red-500' : ''}`}
                                        name="username"
                                        type="text"
                                        placeholder="Username *"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                                </div>
                                <div className="pass mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                                        name="password"
                                        type="password"
                                        placeholder="Password *"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div className="confirm-pass mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm Password *"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                                <div className="first-name mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                                        name="firstName"
                                        type="text"
                                        placeholder="First Name *"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>
                                <div className="last-name mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                                        name="lastName"
                                        type="text"
                                        placeholder="Last Name *"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                </div>
                                <div className="email mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                                        name="email"
                                        type="email"
                                        placeholder="Email *"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div className="phone mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.phoneNumber ? 'border-red-500' : ''}`}
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Phone Number *"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                </div>
                                <div className="address mt-5">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.address ? 'border-red-500' : ''}`}
                                        name="address"
                                        type="text"
                                        placeholder="Address *"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>
                                <div className='flex items-center mt-5'>
                                    <div className="block-input">
                                        <input
                                            type="checkbox"
                                            name='agreeToTerms'
                                            id='agreeToTerms'
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                        />
                                        <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                    </div>
                                    <label htmlFor='agreeToTerms' className="pl-2 cursor-pointer text-secondary2">I agree to the
                                        <Link href={'#!'} className='text-black hover:underline pl-1'>Terms of User</Link>
                                    </label>
                                    {errors.agreeToTerms && <p className="text-red-500 text-sm ml-2">{errors.agreeToTerms}</p>}
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button 
                                        className="button-main" 
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Already have an account?</div>
                                <div className="mt-2 text-secondary">Welcome back. Sign in to access your personalized experience, saved preferences, and more. We{String.raw`'re`} thrilled to have you with us again!</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main">Login</Link>
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

export default Register