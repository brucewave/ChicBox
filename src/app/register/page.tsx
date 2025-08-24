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
    const [registrationResult, setRegistrationResult] = useState<string>('');

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
        // Clear registration result when user starts typing
        if (registrationResult) {
            setRegistrationResult('');
        }
    };

    const validateForm = () => {
        console.log('🔍 Starting form validation...');
        const newErrors: FormErrors = {};
        
        if (!formData.username) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
            console.log('❌ Username missing');
        }
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            console.log('❌ Password missing');
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            console.log('❌ Confirm password missing');
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            console.log('❌ Password mismatch');
        }
        if (!formData.firstName) {
            newErrors.firstName = 'Vui lòng nhập tên';
            console.log('❌ First name missing');
        }
        if (!formData.lastName) {
            newErrors.lastName = 'Vui lòng nhập họ';
            console.log('❌ Last name missing');
        }
        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email';
            console.log('❌ Email missing');
        }
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
            console.log('❌ Phone number missing');
        }
        if (!formData.address) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
            console.log('❌ Address missing');
        }
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản';
            console.log('❌ Terms not agreed');
        }

        console.log('📊 Validation errors:', newErrors);
        console.log('🔢 Total errors:', Object.keys(newErrors).length);
        
        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        console.log('✅ Form validation result:', isValid);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('🔄 Form submitted!');
        console.log('📝 Form data:', formData);
        
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        
        console.log('✅ Form validation passed, starting API call...');

        setIsLoading(true);
        setRegistrationResult('');
        
        try {
            console.log('🚀 Đang gửi request đăng ký...');
            console.log('📤 Data gửi đi:', {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            });
            console.log('🌐 API URL: https://api.roomily.tech/api/v1/auth/register');
            
            const response = await axios.post(`https://api.roomily.tech/api/v1/auth/register`, {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('🎉 Response thành công:', response.data);
            console.log('📊 Status:', response.status);
            
            // Hiển thị thông báo thành công
            setRegistrationResult('✅ Đăng ký thành công! Tài khoản đã được tạo.');
            
            toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Chuyển hướng sau 3 giây
            setTimeout(() => {
                console.log('🔄 Redirecting to login page...');
                router.push('/login');
            }, 3000);
            
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error('💥 Registration error:', error);
            console.error('🔍 Error details:', {
                status: apiError.response?.status,
                message: apiError.response?.data?.message,
                data: apiError.response?.data
            });
            
            // Hiển thị thông báo lỗi
            if (apiError.response?.data?.message) {
                const errorMessage = apiError.response.data.message;
                setRegistrationResult('❌ Đăng ký thất bại');
                
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
                setRegistrationResult('❌ Đăng ký thất bại');
                toast.error('Tên đăng nhập, email hoặc số điện thoại đã tồn tại');
            } else {
                setRegistrationResult('❌ Đăng ký thất bại');
                toast.error('Đăng ký thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            console.log('🏁 API call completed');
            setIsLoading(false);
        }
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Tạo Tài Khoản' subHeading='Tạo Tài Khoản' />
            </div>
            <div className="register-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Đăng Ký</div>
                            
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="email">
                                    <input 
                                        className={`border-line px-4 pt-3 pb-3 w-full rounded-lg ${errors.username ? 'border-red-500' : ''}`}
                                        name="username"
                                        type="text"
                                        placeholder="Tên đăng nhập *"
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
                                        placeholder="Mật khẩu *"
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
                                        placeholder="Xác nhận mật khẩu *"
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
                                        placeholder="Tên *"
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
                                        placeholder="Họ *"
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
                                        placeholder="Số điện thoại *"
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
                                        placeholder="Địa chỉ *"
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
                                    <label htmlFor='agreeToTerms' className="pl-2 cursor-pointer text-secondary2">Tôi đồng ý với
                                        <Link href={'#!'} className='text-black hover:underline pl-1'>Điều Khoản Sử Dụng</Link>
                                    </label>
                                    {errors.agreeToTerms && <p className="text-red-500 text-sm ml-2">{errors.agreeToTerms}</p>}
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button 
                                        className="button-main bg-black text-white hover:bg-[var(--green)] transition-colors duration-300" 
                                        type="submit"
                                        disabled={isLoading}
                                        onClick={() => console.log('🔘 Submit button clicked!')}
                                    >
                                        {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                                    </button>
                                </div>
                                
                                {/* Enhanced Registration Result Display */}
                                {registrationResult && (
                                    <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                                        registrationResult.includes('✅') 
                                            ? 'bg-green-100 text-green-800 border border-green-400' 
                                            : 'bg-red-100 text-red-800 border border-red-400'
                                    }`}>
                                        {registrationResult}
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Đã có tài khoản?</div>
                                <div className="mt-2 text-secondary">Chào mừng bạn trở lại. Đăng nhập để truy cập trải nghiệm cá nhân hóa, tùy chọn đã lưu và nhiều hơn nữa. Chúng tôi rất vui mừng được gặp lại bạn!</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main bg-black text-white hover:bg-[var(--green)] transition-colors duration-300">Đăng Nhập</Link>
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