/**
 * "Smarter pack" suggestions for products sold in several pack sizes
 * (e.g. 3-pack, 6-pack, 12-pack). Computed by the backend
 * (GET /product/pack-suggestions/:id?quantity=N) with the same pricing rules
 * as cart and checkout. Display only: the cart reprices from the database.
 */

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export type PackPlanItem = {
    productId: string;
    name: string;
    slug: string;
    image: string;
    units: number;
    quantity: number;
    lineTotal: number;
};

export type PackPlan = {
    items: PackPlanItem[];
    units: number;
    total: number;
    /** Selection total minus plan total. Negative = the plan costs more. */
    savings: number;
    /** Plan units minus selection units. */
    extraUnits: number;
};

export type PackSuggestions = {
    unitLabel: string;
    current: { units: number; total: number };
    /** Same units, lower price (e.g. 6-pack + 3-pack). */
    exactMatch: PackPlan | null;
    /** More units, lower price per unit (e.g. the 12-pack). */
    bestValue: PackPlan | null;
};

const cache = new Map<string, PackSuggestions | null>();

/** null when the product has no pack sizes set up or nothing beats the selection. */
export async function fetchPackSuggestions(
    productId: string,
    quantity: number,
    signal?: AbortSignal
): Promise<PackSuggestions | null> {
    const key = `${productId}:${quantity}`;
    if (cache.has(key)) return cache.get(key) ?? null;

    const response = await fetch(
        `${API_URL}/product/pack-suggestions/${encodeURIComponent(productId)}?quantity=${quantity}`,
        { cache: "no-store", signal }
    );
    if (!response.ok) throw new Error("Unable to load pack suggestions");

    const data = await response.json().catch(() => null);
    const suggestions = data?.suggestions;

    const result: PackSuggestions | null =
        suggestions && (suggestions.exactMatch || suggestions.bestValue)
            ? {
                unitLabel: typeof data.unitLabel === "string" ? data.unitLabel : "",
                current: suggestions.current,
                exactMatch: suggestions.exactMatch ?? null,
                bestValue: suggestions.bestValue ?? null,
            }
            : null;

    cache.set(key, result);
    return result;
}

/** "6-pack + 3-pack", "2 × 6-pack". */
export function describePlan(plan: PackPlan) {
    return plan.items
        .map((item) => (item.quantity > 1 ? `${item.quantity} × ${item.name}` : item.name))
        .join(" + ");
}
