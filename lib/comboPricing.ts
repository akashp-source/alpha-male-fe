/**
 * Combo pricing preview for the product page.
 *
 * Mirrors the backend rules in alpha-male-backend
 * `src/product/combo-pricing.util.ts`. The backend recomputes the price at
 * checkout and is the source of truth; cart and checkout show the amounts
 * returned by GET /cart.
 *
 *  1. Quantity equals a combo tier ("2 for ₹899")  -> tier price
 *  2. Quantity above the largest tier and a bulk percent is set -> percent off
 *  3. Otherwise -> regular price × quantity
 */

type ComboProduct = {
    price: number;
    comboOffers?: { quantity: number; offerPrice: number }[] | null;
    bulkDiscountPercent?: number | null;
};

export type ComboPricing = {
    regularTotal: number;
    total: number;
    savings: number;
    appliedOffer:
        | { type: "COMBO"; quantity: number }
        | { type: "BULK_PERCENT"; percent: number; minQuantity: number }
        | null;
};

const MAX_BULK_DISCOUNT_PERCENT = 90;

function validTiers(product: ComboProduct) {
    return (product.comboOffers ?? []).filter(
        (offer) =>
            Number.isInteger(offer.quantity) &&
            offer.quantity >= 2 &&
            Number.isFinite(offer.offerPrice) &&
            offer.offerPrice > 0
    );
}

export function getBulkDiscountPercent(product: ComboProduct) {
    const percent = Number(product.bulkDiscountPercent ?? 0);
    return Number.isFinite(percent) && percent > 0 && percent <= MAX_BULK_DISCOUNT_PERCENT
        ? percent
        : 0;
}

/** Smallest quantity that gets the bulk percent (largest tier + 1). */
export function getBulkDiscountMinQuantity(product: ComboProduct) {
    return validTiers(product).reduce((max, offer) => Math.max(max, offer.quantity), 1) + 1;
}

export function calculateComboPricing(product: ComboProduct, quantity: number): ComboPricing {
    const unitPaise = Math.round(Number(product.price) * 100);
    const regularPaise = unitPaise * quantity;
    const regular: ComboPricing = {
        regularTotal: regularPaise / 100,
        total: regularPaise / 100,
        savings: 0,
        appliedOffer: null,
    };

    if (!Number.isFinite(unitPaise) || unitPaise <= 0 || !Number.isInteger(quantity) || quantity < 2) {
        return regular;
    }

    const exact = validTiers(product)
        .filter((offer) => offer.quantity === quantity)
        .sort((a, b) => a.offerPrice - b.offerPrice)[0];

    if (exact) {
        const offerPaise = Math.round(exact.offerPrice * 100);
        if (offerPaise >= regularPaise) return regular;
        return {
            regularTotal: regularPaise / 100,
            total: offerPaise / 100,
            savings: (regularPaise - offerPaise) / 100,
            appliedOffer: { type: "COMBO", quantity: exact.quantity },
        };
    }

    const percent = getBulkDiscountPercent(product);
    const minQuantity = getBulkDiscountMinQuantity(product);

    if (percent > 0 && quantity >= minQuantity) {
        const discountPaise = Math.round((regularPaise * percent) / 100);
        if (discountPaise <= 0 || discountPaise >= regularPaise) return regular;
        return {
            regularTotal: regularPaise / 100,
            total: (regularPaise - discountPaise) / 100,
            savings: discountPaise / 100,
            appliedOffer: { type: "BULK_PERCENT", percent, minQuantity },
        };
    }

    return regular;
}
