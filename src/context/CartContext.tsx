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

interface CartContextProps {
    cartState: CartState;
    addToCart: (item: ProductType) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
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

    // Load cart items on mount
    useEffect(() => {
        const loadCartItems = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) {
                dispatch({ type: 'LOAD_CART', payload: [] });
                dispatch({ type: 'SET_LOADING', payload: false });
                return;
            }

            try {
                dispatch({ type: 'SET_LOADING', payload: true });
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
            }
        };

        loadCartItems();
    }, []);

    const addToCart = async (item: ProductType) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            // If not logged in, just update local state
            const existingItem = cartState.cartArray.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                dispatch({ type: 'UPDATE_CART', payload: { itemId: item.id, quantity: existingItem.quantity + 1, selectedSize: existingItem.selectedSize, selectedColor: existingItem.selectedColor } });
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

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const cartItem: CartItem = {
                ...item,
                quantity: 1,
                selectedSize: item.sizes?.[0] || '',
                selectedColor: item.variation?.[0]?.color || ''
            };
            await cartService.addToCart(cartItem.id);
            dispatch({ type: 'ADD_TO_CART', payload: cartItem });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
            throw error;
        }
    };

    const removeFromCart = async (itemId: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            // If not logged in, just update local state
            dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await cartService.removeFromCart(itemId);
            dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
            throw error;
        }
    };

    const updateCart = (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
        dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
    };

    return (
        <CartContext.Provider value={{ cartState, addToCart, removeFromCart, updateCart }}>
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
