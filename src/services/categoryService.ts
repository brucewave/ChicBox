const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomily.tech';

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

export interface Category {
    id: number;
    name: string;
    description: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const categoryService = {
    // Get all categories
    async getCategories(): Promise<Category[]> {
        const response = await fetch(`${baseUrl}/api/v1/categories`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        return response.json();
    },

    // Create a new category
    async createCategory(categoryData: { name: string; description: string; isActive?: boolean }): Promise<Category> {
        console.log('Creating category with data:', categoryData);
        console.log('Using baseUrl:', baseUrl);
        
        const response = await fetch(`${baseUrl}/api/v1/categories`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData),
        });
        
        console.log('Create category response status:', response.status);
        console.log('Create category response headers:', response.headers);
        
        if (!response.ok) {
            let errorMessage = `Failed to create category: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                console.error('Create category error data:', errorData);
            } catch (e) {
                console.error('Could not parse error response:', e);
            }
            throw new Error(errorMessage);
        }
        
        // Try to parse JSON response
        try {
            const result = await response.json();
            console.log('Create category success response:', result);
            return result;
        } catch (error) {
            console.error('Failed to parse success response:', error);
            // If JSON parsing fails but status is OK, return a basic category object
            return {
                id: Date.now(), // Temporary ID
                name: categoryData.name,
                description: categoryData.description,
                isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
                createdAt: new Date().toISOString()
            };
        }
    },

    // Update a category
    async updateCategory(categoryId: number, categoryData: { name: string; description: string; isActive?: boolean }): Promise<Category> {
        const response = await fetch(`${baseUrl}/api/v1/categories/${categoryId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to update category: ${response.status} ${response.statusText}`);
        }
        
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (error) {
                // If JSON parsing fails, return the updated data as fallback
                return {
                    id: categoryId,
                    name: categoryData.name,
                    description: categoryData.description,
                    isActive: categoryData.isActive,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // If no JSON content, return the updated data
            return {
                id: categoryId,
                name: categoryData.name,
                description: categoryData.description,
                isActive: categoryData.isActive,
                updatedAt: new Date().toISOString()
            };
        }
    },

    // Delete a category
    async deleteCategory(categoryId: number): Promise<void> {
        const response = await fetch(`${baseUrl}/api/v1/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to delete category: ${response.status} ${response.statusText}`);
        }
        // For DELETE operations, we don't need to parse response body
        // Just check if the status is successful (2xx range)
    }
}; 