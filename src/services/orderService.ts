import { OrderResponse } from '@/type/OrderType';

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

export const orderService = {
    async getOrders(page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDirection: string = 'desc'): Promise<OrderResponse> {
        const response = await fetch(
            `${baseUrl}/api/v1/orders?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    },

    async getOrderById(orderId: number) {
        const response = await fetch(`${baseUrl}/api/v1/orders/${orderId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch order: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    },

    async updateOrderStatus(orderId: number, status: string) {
        const response = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            const errorMessage = errorData.message || `Failed to update order status: ${response.status} ${response.statusText}`;
            
            // Handle specific backend errors
            if (errorMessage.includes("loyaltyPoints") || errorMessage.includes("intValue")) {
                throw new Error("Cannot update order status: User loyalty points data is missing. Please contact support.");
            }
            
            throw new Error(errorMessage);
        }
        return response.json();
    }
}; 