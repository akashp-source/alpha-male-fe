const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

function getGuestId() {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
    }

    return guestId;
}

export async function addToCart(
    productId: string,
    quantity = 1
) {
    if (!productId) {
        throw new Error("Product ID is required");
    }

    const token = localStorage.getItem("token");
    const guestId = getGuestId();

    const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-guest-id": guestId,
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
        },
        body: JSON.stringify({
            productId,
            quantity,
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message || "Unable to add product to cart"
        );
    }

    // Notify navbar and cart drawer
    window.dispatchEvent(new Event("cart-updated"));

    return data;
}

export async function getCart() {
    const token = localStorage.getItem("token");
    const guestId = getGuestId();

    const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers: {
            "x-guest-id": guestId,
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
        },
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Unable to fetch cart");
    }

    return data;
}