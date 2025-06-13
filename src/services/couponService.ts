import axios from 'axios';

export interface Coupon {
    id: number;
    name: string;
    couponCode: string;
    couponPercentage: number;
    isActive: boolean | null;
    remainingUses: number;
    isCurrentlyValid: boolean;
    validFrom: string;
    validUntil: string;
    status: string;
}

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        console.warn('No authentication token found');
        return null;
    }
    return { Authorization: `Bearer ${token}` };
};

export const couponService = {
    getAllCoupons: async (): Promise<Coupon[]> => {
        try {
            const headers = getAuthHeader();
            if (!headers) {
                console.warn('Skipping getAllCoupons: No authentication token');
                return [];
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`, {
                headers
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all coupons:', error);
            return [];
        }
    },

    getActiveCoupons: async (): Promise<Coupon[]> => {
        try {
            const headers = getAuthHeader();
            if (!headers) {
                console.warn('Skipping getActiveCoupons: No authentication token');
                return [];
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/active`, {
                headers
            });
            console.log('Active coupons response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching active coupons:', error);
            return [];
        }
    },

    getCouponByCode: async (code: string): Promise<Coupon | null> => {
        try {
            const headers = getAuthHeader();
            if (!headers) {
                console.warn('Skipping getCouponByCode: No authentication token');
                return null;
            }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/code/${code}`, {
                headers
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching coupon by code:', error);
            return null;
        }
    },

    applyCoupon: async (couponCode: string, originalPrice: number): Promise<{
        couponAmount: number;
        originalPrice: number;
        couponCode: string;
        couponedPrice: number;
    } | null> => {
        try {
            // Get active coupons first
            const activeCoupons = await couponService.getActiveCoupons();
            const coupon = activeCoupons.find(c => c.couponCode === couponCode);

            if (!coupon) {
                console.error('Coupon not found or not active');
                return null;
            }

            // Calculate discount
            const discountAmount = (originalPrice * coupon.couponPercentage) / 100;
            const finalPrice = originalPrice - discountAmount;

            return {
                couponAmount: discountAmount,
                originalPrice: originalPrice,
                couponCode: couponCode,
                couponedPrice: finalPrice
            };
        } catch (error) {
            console.error('Error applying coupon:', error);
            return null;
        }
    },

    getUserCoupons: async (): Promise<Coupon[]> => {
        try {
            const headers = getAuthHeader();
            if (!headers) {
                console.warn('Skipping getUserCoupons: No authentication token');
                return [];
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/user`, {
                headers
            });
            console.log('User coupons response:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    console.log('User not authenticated, skipping user coupons');
                    return [];
                }
                console.error('Error fetching user coupons:', error.response?.data || error.message);
            } else {
                console.error('Error fetching user coupons:', error);
            }
            return [];
        }
    }
}; 