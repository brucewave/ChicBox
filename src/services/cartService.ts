import { ProductType } from '@/type/ProductType';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json' // Assuming JSON content type for most requests
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const cartService = {
    async getCartItems() {
        const response = await fetch(`${baseUrl}/api/v1/cart`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch cart items: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    },

    async addToCart(productId: string) {
        const response = await fetch(`${baseUrl}/api/v1/cart/add/${productId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add item to cart: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Assuming success without a JSON body being returned
        return;
    },

    async removeFromCart(productId: string) {
        const response = await fetch(`${baseUrl}/api/v1/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to remove item from cart: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Assuming success without a JSON body being returned
        return;
    }
}; 