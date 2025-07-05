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

export interface Category {
    id: number;
    name: string;
    description: string;
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
    async createCategory(categoryData: { name: string; description: string }): Promise<Category> {
        const response = await fetch(`${baseUrl}/api/v1/categories`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to create category: ${response.status} ${response.statusText}`);
        }
        
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (error) {
                // If JSON parsing fails, throw an error for create operations
                throw new Error('Failed to parse response from server');
            }
        } else {
            // If no JSON content, throw an error for create operations
            throw new Error('Server did not return expected response format');
        }
    },

    // Update a category
    async updateCategory(categoryId: number, categoryData: { name: string; description: string }): Promise<Category> {
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
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // If no JSON content, return the updated data
            return {
                id: categoryId,
                name: categoryData.name,
                description: categoryData.description,
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