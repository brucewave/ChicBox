const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export interface DashboardStats {
    products: {
        total: number;
        active: number;
        inactive: number;
    };
    orders: {
        total: number;
        totalItems: number;
        totalRevenue: number;
        pending: number;
        confirmed: number;
        processing: number;
        delivered: number;
        cancelled: number;
        refunded: number;
        duplicate: number;
        statusCounts: {
            PENDING: number;
            CONFIRMED: number;
            PROCESSING: number;
            DELIVERED: number;
            CANCELLED: number;
            REFUNDED: number;
            DUPLICATE: number;
        };
    };
    categories: {
        total: number;
    };
    coupons: {
        total: number;
        active: number;
        expired: number;
    };
    recentOrders: Array<{
        id: number;
        orderNumber: string;
        customerName: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: number;
        name: string;
        sales: number;
        revenue: number;
    }>;
}

export const dashboardService = {
    // Get all dashboard statistics
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Fetch all data in parallel
            const [products, orders, categories, coupons] = await Promise.all([
                this.getProductsStats(),
                this.getOrdersStats(),
                this.getCategoriesStats(),
                this.getCouponsStats()
            ]);

            return {
                products,
                orders,
                categories,
                coupons,
                recentOrders: await this.getRecentOrders(),
                topProducts: await this.getTopProducts()
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get products statistics
    async getProductsStats() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/products`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }

            const products = await response.json();
            
            return {
                total: products.length,
                active: products.filter((p: any) => p.status === 'ACTIVE').length,
                inactive: products.filter((p: any) => p.status === 'INACTIVE').length
            };
        } catch (error) {
            console.error('Error fetching products stats:', error);
            return { total: 0, active: 0, inactive: 0 };
        }
    },

    // Get orders statistics from dedicated dashboard API
    async getOrdersStats() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/orders/dashboard/stats`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch orders stats: ${response.status}`);
            }

            const stats = await response.json();
            
            // Map the API response to our expected format
            return {
                total: stats.totalOrders || 0,
                totalItems: 0, // Not provided by this API
                totalRevenue: stats.totalRevenue || 0,
                pending: stats.pendingOrders || 0,
                confirmed: stats.confirmedOrders || 0,
                processing: 0, // Not provided by this API
                delivered: stats.deliveredOrders || 0,
                cancelled: stats.cancelledOrders || 0,
                refunded: 0, // Not provided by this API
                duplicate: 0, // Not provided by this API
                statusCounts: {
                    PENDING: stats.pendingOrders || 0,
                    CONFIRMED: stats.confirmedOrders || 0,
                    PROCESSING: 0,
                    DELIVERED: stats.deliveredOrders || 0,
                    CANCELLED: stats.cancelledOrders || 0,
                    REFUNDED: 0,
                    DUPLICATE: 0
                }
            };
        } catch (error) {
            console.error('Error fetching orders stats:', error);
            return {
                total: 0,
                totalItems: 0,
                totalRevenue: 0,
                pending: 0,
                confirmed: 0,
                processing: 0,
                delivered: 0,
                cancelled: 0,
                refunded: 0,
                duplicate: 0,
                statusCounts: {
                    PENDING: 0,
                    CONFIRMED: 0,
                    PROCESSING: 0,
                    DELIVERED: 0,
                    CANCELLED: 0,
                    REFUNDED: 0,
                    DUPLICATE: 0
                }
            };
        }
    },

    // Get categories statistics
    async getCategoriesStats() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/categories`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }

            const categories = await response.json();
            
            return {
                total: categories.length
            };
        } catch (error) {
            console.error('Error fetching categories stats:', error);
            return { total: 0 };
        }
    },

    // Get coupons statistics
    async getCouponsStats() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/coupons`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch coupons: ${response.status}`);
            }

            const coupons = await response.json();
            const now = new Date();
            
            const active = coupons.filter((coupon: any) => {
                const expiryDate = new Date(coupon.expiryDate);
                return expiryDate > now && coupon.status === 'ACTIVE';
            }).length;

            const expired = coupons.filter((coupon: any) => {
                const expiryDate = new Date(coupon.expiryDate);
                return expiryDate <= now;
            }).length;

            return {
                total: coupons.length,
                active,
                expired
            };
        } catch (error) {
            console.error('Error fetching coupons stats:', error);
            return { total: 0, active: 0, expired: 0 };
        }
    },

    // Get recent orders
    async getRecentOrders() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/orders?limit=5`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch recent orders: ${response.status}`);
            }

            const orders = await response.json();
            
            return orders.slice(0, 5).map((order: any) => ({
                id: order.id,
                orderNumber: order.orderNumber || `#${order.id}`,
                customerName: order.customerName || 'Unknown Customer',
                total: parseFloat(order.total || 0),
                status: order.status || 'PENDING',
                createdAt: order.createdAt
            }));
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            return [];
        }
    },

    // Get top products (mock data for now)
    async getTopProducts() {
        try {
            const response = await fetch(`${baseUrl}/api/v1/products`, {
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }

            const products = await response.json();
            
            // For now, return first 5 products with mock sales data
            return products.slice(0, 5).map((product: any, index: number) => ({
                id: product.id,
                name: product.name,
                sales: Math.floor(Math.random() * 100) + 10, // Mock sales data
                revenue: Math.floor(Math.random() * 1000) + 100 // Mock revenue data
            }));
        } catch (error) {
            console.error('Error fetching top products:', error);
            return [];
        }
    }
}; 