const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const getFormDataHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const productService = {
    // Upload images to a product
    async uploadProductImages(productId: number, images: File[]) {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        const response = await fetch(`${baseUrl}/api/v1/products/${productId}/images`, {
            method: 'POST',
            headers: getFormDataHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to upload images: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Remove images from a product
    async removeProductImages(productId: number, imageIds: number[]) {
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}/images`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify({ imageIds }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to remove images: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Update product primary image
    async updateProductPrimaryImage(productId: number, imageId: number) {
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}/primary-image/${imageId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to update primary image: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Get product images
    async getProductImages(productId: number) {
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}/images`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to fetch product images: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Create product with images
    async createProduct(productData: FormData) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const response = await fetch(`${baseUrl}/api/v1/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: productData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to create product: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Update product
    async updateProduct(productId: number, productData: FormData) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: productData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to update product: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Get products with pagination
    async getProducts(page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc') {
        const response = await fetch(
            `${baseUrl}/api/v1/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Delete product
    async deleteProduct(productId: number) {
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to delete product: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    // Update product status
    async updateProductStatus(productId: number, status: string) {
        const response = await fetch(`${baseUrl}/api/v1/products/${productId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to update product status: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}; 