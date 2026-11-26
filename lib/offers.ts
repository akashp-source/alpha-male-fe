// Discount for paying online (Razorpay). Must match PREPAID_DISCOUNT_RATE in
// the backend (alpha-male-backend/src/payment/payment.service.ts), which is
// what Razorpay actually charges.
export const ONLINE_PAYMENT_DISCOUNT_PERCENT = 12;

/**
 * Online payment discount in rupees for an item subtotal (after combo
 * offers), rounded to the paisa the same way the backend does.
 */
export function onlinePaymentDiscount(subtotal: number): number {
    const subtotalPaise = Math.round(Number(subtotal || 0) * 100);
    return Math.round(subtotalPaise * (ONLINE_PAYMENT_DISCOUNT_PERCENT / 100)) / 100;
}
