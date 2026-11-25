// "Check delivery date" on the product page (GET /ship-rocket/delivery-estimate).

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface DeliveryEstimate {
    pincode: string;
    serviceable: boolean;
    // Fastest courier's estimate, when available.
    estimatedDays: number | null;
    etd: string | null;
    codAvailable: boolean;
}

export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

export async function fetchDeliveryEstimate(
    pincode: string,
    signal?: AbortSignal,
): Promise<DeliveryEstimate> {
    const res = await fetch(
        `${API_URL}/ship-rocket/delivery-estimate?pincode=${encodeURIComponent(pincode)}`,
        { cache: "no-store", signal },
    );

    if (res.status === 429) {
        throw new Error("Too many checks. Please wait a minute and try again.");
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const message = typeof data?.message === "string" ? data.message : "";
        throw new Error(message || "We couldn't check delivery right now. Please try again.");
    }
    return data as DeliveryEstimate;
}
