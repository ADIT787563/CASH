export interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId?: number | null;
}

export interface OrderTimeline {
    id: string;
    status: string;
    note?: string | null;
    createdAt: string;
    createdBy?: string | null;
}

export interface Order {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    shippingAddress?: string | null;

    totalAmount: number;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;

    status: string; // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    paymentStatus: string; // 'unpaid', 'paid', 'refunded'
    paymentMethod?: string | null;

    orderDate: string;
    invoiceUrl?: string | null;

    notesInternal?: string | null;

    items: OrderItem[];
    timeline: OrderTimeline[];
}
