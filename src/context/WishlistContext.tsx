'use client'

// WishlistContext.tsx
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';
import { wishlistService } from '@/services/wishlistService';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

interface WishlistState {
    wishlistArray: ProductType[];
    isLoading: boolean;
    error: string | null;
}

type WishlistAction =
    | { type: 'ADD_TO_WISHLIST'; payload: ProductType }
    | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
    | { type: 'LOAD_WISHLIST'; payload: ProductType[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_WISHLIST' }

interface WishlistContextProps {
    wishlistState: WishlistState;
    addToWishlist: (item: ProductType) => Promise<void>;
    removeFromWishlist: (itemId: string) => Promise<void>;
    syncWishlistWithServer: () => Promise<void>;
    refreshWishlist: () => Promise<void>;
    getWishlistCount: () => number;
    isInWishlist: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'ADD_TO_WISHLIST':
            return {
                ...state,
                wishlistArray: [...state.wishlistArray, action.payload],
                isLoading: false,
                error: null
            };
        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                wishlistArray: state.wishlistArray.filter((item) => item.id !== action.payload),
                isLoading: false,
                error: null
            };
        case 'LOAD_WISHLIST':
            return {
                ...state,
                wishlistArray: action.payload,
                isLoading: false,
                error: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };
        case 'RESET_WISHLIST':
            return {
                ...state,
                wishlistArray: [],
                isLoading: false,
                error: null
            };
        default:
            return state;
    }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistState, dispatch] = useReducer(wishlistReducer, {
        wishlistArray: [],
        isLoading: true,
        error: null
    });

    // Function to sync wishlist with server
    const syncWishlistWithServer = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Load local wishlist for non-authenticated users
                const localWishlist = localStorage.getItem('localWishlist');
                const parsedWishlist = localWishlist ? JSON.parse(localWishlist) : [];
                dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
                return;
            }

            // Load server wishlist for authenticated users
            const apiItems = await wishlistService.getWishlist();
            const mappedItems: ProductType[] = apiItems.map((apiItem: any) => ({
                id: String(apiItem.productId),
                category: apiItem.categoryName || '',
                type: '',
                name: apiItem.productName,
                gender: '',
                new: false,
                sale: false,
                rate: 0,
                price: apiItem.productPrice,
                originPrice: apiItem.productPrice,
                brand: '',
                sold: 0,
                quantity: 0,
                quantityPurchase: 1,
                sizes: apiItem.productSize ? [apiItem.productSize] : [],
                variation: [],
                thumbImage: [apiItem.primaryImageUrl ? `${baseUrl}/api/v1/images/${apiItem.primaryImageUrl}` : '/assets/images/product_placeholder.png'],
                images: [],
                description: '',
                action: '',
                slug: String(apiItem.productId),
                conditionPoints: 0,
                status: '',
                averageRating: 0,
                isAvailable: apiItem.isAvailable
            }));
            dispatch({ type: 'LOAD_WISHLIST', payload: mappedItems });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist items' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // New function to refresh wishlist
    const refreshWishlist = async () => {
        await syncWishlistWithServer();
    };

    // Function to check if product is in wishlist
    const isInWishlist = async (productId: string) => {
        return await wishlistService.isFavorite(productId);
    };

    // Load wishlist items on mount
    useEffect(() => {
        syncWishlistWithServer();
    }, []);

    // Listen for token changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (e.newValue === null) {
                    // User logged out - clear wishlist
                    dispatch({ type: 'RESET_WISHLIST' });
                    localStorage.removeItem('localWishlist');
                } else {
                    // User logged in - immediately refresh wishlist
                    refreshWishlist();
                }
            }
        };

        // Listen for storage events (for cross-tab communication)
        window.addEventListener('storage', handleStorageChange);

        // Create a custom event for token changes
        const handleTokenChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.token === null) {
                // User logged out - clear wishlist
                dispatch({ type: 'RESET_WISHLIST' });
                localStorage.removeItem('localWishlist');
            } else {
                // User logged in - immediately refresh wishlist
                refreshWishlist();
            }
        };

        // Add event listener for custom token change event
        window.addEventListener('tokenChange', handleTokenChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokenChange', handleTokenChange as EventListener);
        };
    }, []);

    // Save local wishlist whenever it changes for non-authenticated users
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            localStorage.setItem('localWishlist', JSON.stringify(wishlistState.wishlistArray));
        }
    }, [wishlistState.wishlistArray]);

    const addToWishlist = async (item: ProductType) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Handle local wishlist for non-authenticated users
                dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
                return;
            }

            // Handle server wishlist for authenticated users
            const isFavorite = await wishlistService.toggleFavorite(item.id);
            if (isFavorite) {
                dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to wishlist' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const removeFromWishlist = async (itemId: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Handle local wishlist for non-authenticated users
                dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
                return;
            }

            // Handle server wishlist for authenticated users
            const isFavorite = await wishlistService.toggleFavorite(itemId);
            if (!isFavorite) {
                dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from wishlist' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Function to get correct wishlist count
    const getWishlistCount = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            // For non-authenticated users, use local wishlist
            const localWishlist = localStorage.getItem('localWishlist');
            const parsedWishlist = localWishlist ? JSON.parse(localWishlist) : [];
            return parsedWishlist.length;
        }
        // For authenticated users, use server wishlist
        return wishlistState.wishlistArray.length;
    };

    // Add effect to refresh wishlist count when wishlistState changes
    useEffect(() => {
        getWishlistCount();
    }, [wishlistState.wishlistArray]);

    return (
        <WishlistContext.Provider value={{
            wishlistState,
            addToWishlist,
            removeFromWishlist,
            syncWishlistWithServer,
            refreshWishlist,
            getWishlistCount,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
