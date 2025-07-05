'use client'

// CartContext.tsx
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';
import { cartService } from '@/services/cartService';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

interface CartItem extends ProductType {
    quantity: number
    selectedSize: string
    selectedColor: string
}

interface CartState {
    cartArray: CartItem[]
    isLoading: boolean
    error: string | null
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: CartItem }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | {
        type: 'UPDATE_CART'; payload: {
            itemId: string; quantity: number, selectedSize: string, selectedColor: string
        }
    }
    | { type: 'LOAD_CART'; payload: CartItem[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_CART' }

interface CartContextProps {
    cartState: CartState;
    addToCart: (item: ProductType) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
    syncCartWithServer: () => Promise<void>;
    refreshCart: () => Promise<void>;
    getCartCount: () => number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            return {
                ...state,
                cartArray: [...state.cartArray, action.payload],
                isLoading: false,
                error: null
            };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartArray: state.cartArray.filter((item) => item.id !== action.payload),
                isLoading: false,
                error: null
            };
        case 'UPDATE_CART':
            return {
                ...state,
                cartArray: state.cartArray.map((item) =>
                    item.id === action.payload.itemId
                        ? {
                            ...item,
                            quantity: action.payload.quantity,
                            selectedSize: action.payload.selectedSize,
                            selectedColor: action.payload.selectedColor
                        }
                        : item
                ),
            };
        case 'LOAD_CART':
            return {
                ...state,
                cartArray: action.payload,
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
        case 'RESET_CART':
            return {
                ...state,
                cartArray: [],
                isLoading: false,
                error: null
            };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartState, dispatch] = useReducer(cartReducer, { 
        cartArray: [],
        isLoading: true,
        error: null
    });

    // Function to sync cart with server
    const syncCartWithServer = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Load local cart for non-authenticated users
                const localCart = localStorage.getItem('localCart');
                const parsedCart = localCart ? JSON.parse(localCart) : [];
                dispatch({ type: 'LOAD_CART', payload: parsedCart });
                return;
            }

            // Load server cart for authenticated users
            const apiItems = await cartService.getCartItems();
            const mappedItems: CartItem[] = apiItems.map((apiItem: any) => {
                const imageUrl = apiItem.primaryImageUrl ? `${baseUrl}/api/v1/images/${apiItem.primaryImageUrl}` : '/assets/images/product_placeholder.png';

                return {
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
                    quantity: apiItem.quantity,
                    quantityPurchase: apiItem.quantity,
                    sizes: apiItem.productSize ? [apiItem.productSize] : [],
                    variation: imageUrl !== '/assets/images/product_placeholder.png' ? [{
                        color: apiItem.productName,
                        colorCode: '',
                        colorImage: imageUrl,
                        image: imageUrl
                    }] : [],
                    thumbImage: [imageUrl],
                    images: [imageUrl],
                    description: '',
                    action: '',
                    slug: String(apiItem.productId),
                    conditionPoints: 0,
                    status: '',
                    averageRating: 0,
                    isAvailable: apiItem.isAvailable
                };
            });
            dispatch({ type: 'LOAD_CART', payload: mappedItems });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart items' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // New function to refresh cart
    const refreshCart = async () => {
        await syncCartWithServer();
    };

    // Load cart items on mount
    useEffect(() => {
        syncCartWithServer();
    }, []);

    // Listen for token changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (e.newValue === null) {
                    // User logged out - clear cart
                    dispatch({ type: 'RESET_CART' });
                    localStorage.removeItem('localCart');
                } else {
                    // User logged in - immediately refresh cart
                    refreshCart();
                }
            }
        };

        // Listen for storage events (for cross-tab communication)
        window.addEventListener('storage', handleStorageChange);

        // Create a custom event for token changes
        const handleTokenChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.token === null) {
                // User logged out - clear cart
                dispatch({ type: 'RESET_CART' });
                localStorage.removeItem('localCart');
            } else {
                // User logged in - immediately refresh cart
                refreshCart();
            }
        };

        // Add event listener for custom token change event
        window.addEventListener('tokenChange', handleTokenChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokenChange', handleTokenChange as EventListener);
        };
    }, []);

    // Save local cart whenever it changes for non-authenticated users
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            localStorage.setItem('localCart', JSON.stringify(cartState.cartArray));
        }
    }, [cartState.cartArray]);

    const addToCart = async (item: ProductType) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Handle local cart for non-authenticated users
                const existingItem = cartState.cartArray.find(cartItem => cartItem.id === item.id);
                if (existingItem) {
                    dispatch({ 
                        type: 'UPDATE_CART', 
                        payload: { 
                            itemId: item.id, 
                            quantity: existingItem.quantity + 1, 
                            selectedSize: existingItem.selectedSize, 
                            selectedColor: existingItem.selectedColor 
                        } 
                    });
                } else {
                    const cartItem: CartItem = {
                        ...item,
                        quantity: 1,
                        selectedSize: item.sizes?.[0] || '',
                        selectedColor: item.variation?.[0]?.color || ''
                    };
                    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
                }
                return;
            }

            // Handle server cart for authenticated users
            await cartService.addToCart(item.id);
            // After adding to server cart, sync the entire cart
            await syncCartWithServer();
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const removeFromCart = async (itemId: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            if (!token) {
                // Handle local cart for non-authenticated users
                dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
                return;
            }

            // Handle server cart for authenticated users
            await cartService.removeFromCart(itemId);
            // After removing from server cart, sync the entire cart
            await syncCartWithServer();
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateCart = (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
        dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
    };

    // Add new function to get correct cart count
    const getCartCount = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            // For non-authenticated users, use local cart
            const localCart = localStorage.getItem('localCart');
            const parsedCart = localCart ? JSON.parse(localCart) : [];
            return parsedCart.length;
        }
        // For authenticated users, use server cart
        // Always get the latest cart count from cartState
        return cartState.cartArray.reduce((total, item) => total + item.quantity, 0);
    };

    // Add effect to refresh cart count when cartState changes
    useEffect(() => {
        getCartCount();
    }, [cartState.cartArray]);

    const clearCart = () => {
        dispatch({ type: 'RESET_CART' });
    };

    return (
        <CartContext.Provider value={{ 
            cartState, 
            addToCart, 
            removeFromCart, 
            updateCart, 
            syncCartWithServer,
            refreshCart,
            getCartCount,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
