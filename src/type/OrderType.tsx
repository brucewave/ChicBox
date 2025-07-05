export interface OrderItem {
    id: number;
    productName: string;
    productBrand: string;
    productSize: string;
    productColor: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    customerUsername: string;
    status: string;
    totalAmount: number;
    discountAmount: number | null;
    depositAmount: number;
    remainingAmount: number;
    shippingAddress: string;
    shippingCity: string;
    shippingWard: string;
    shippingDistrict: string;
    phoneNumber: string;
    fullName: string;
    notes: string;
    orderItems: OrderItem[];
    createdAt: string;
    deliveredAt: string | null;
}

export interface OrderResponse {
    content: Order[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
    firstPage: boolean;
} 