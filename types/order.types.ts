
export interface OrderItem {
    productId: string;
    name: string;
    sku?: string;
    image?: string;
    price: number;
    quantity: number;
    lineTotal: number;
}

export interface OrderAddress {
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface ShipmentScan {
    status?: string;
    activity?: string;
    date?: string;
    createdAt?: string;
    location?: string;
    [key: string]: unknown;
}

export interface Customer {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export interface OrderCancellation {
    reason: string;
    note?: string;
    source: "CUSTOMER" | "ADMIN" | "SYSTEM";
    requestedAt: string;
}

export interface CancellationReasonOption {
    value: string;
    label: string;
    requiresNote: boolean;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer?: Customer;
    items: OrderItem[];
    shippingAddress?: OrderAddress;
    status: string | null;
    paymentMethod: string;
    paymentStatus: string;
    canRetryPayment?: boolean;
    paymentRetryExpiresAt?: string | null;
    // Computed by the API for the order history UI.
    canCancel?: boolean;
    cancelRequiresApproval?: boolean;
    cancellation?: OrderCancellation | null;
    subtotal: number;
    discount: number;
    shippingCharge: number;
    total: number;
    trackingNumber?: string | null;
    awb?: string | null;
    courierName?: string | null;
    shipmentEtd?: string | null;
    shipmentCurrentStatus?: string | null;
    shipmentScans?: ShipmentScan[];
    scans?: ShipmentScan[];
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: Order[];
    pagination: {
        currentPage: number;
        perPage: number;
        totalOrders: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
