
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    LockKeyhole,
    MapPin,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    UserRound,
} from "lucide-react";
import LocationSelect from "@/Components/Utils/LocationSelect";
import { getStoredAttribution } from "@/lib/campaign";



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

type Address = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
};


type Profile = {
    _id: string;
    name: string;
    email: string;
    number: string;
    addresses: Address[];
};

type Product = {
    _id: string;
    name: string;
    title?: string;
    price: number;
    salePrice?: number;
    sellingPrice?: number;
    compareAtPrice?: number | null;
    images?: string[];
    stock?: number;
    isActive?: boolean;
    category?: string;
    discountPercentage?: number;
};

type RecommendedProduct = Product & {
    score?: number;
    purchaseCount?: number;
    confidence?: number;
    lift?: number;
};

type CartRecommendations = {
    frequentlyBoughtTogether: {
        product: RecommendedProduct;
        score?: number;
    }[];
    youMayAlsoLike: RecommendedProduct[];
};

type CartItem = {
    productId: Product;
    quantity: number;
    price: number;
    // Server-computed (GET /cart) with combo offers applied.
    unitPrice?: number;
    regularTotal?: number;
    lineTotal?: number;
    comboDiscount?: number;
};

/** Unit price: server value, else the current product price. */
function getItemUnitPrice(item: CartItem) {
    return Number(item.unitPrice ?? item.productId?.price ?? item.price ?? 0);
}

/** Line total with combo offers, as the backend charges it. */
function getItemLineTotal(item: CartItem) {
    return Number(item.lineTotal ?? getItemUnitPrice(item) * item.quantity);
}

type PaymentMethod = "COD" | "ONLINE";

type AddressForm = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
};

const emptyAddress: AddressForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
};

function getGuestId() {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
        guestId = `guest_${crypto.randomUUID()}`;
        localStorage.setItem("guestId", guestId);
    }

    return guestId;
}

function getToken() {
    return localStorage.getItem("token");
}

function formatPrice(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

export default function CheckoutPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [profile, setProfile] = useState<Profile | null>(null);
    const [items, setItems] = useState<CartItem[]>([]);

    const [recommendations, setRecommendations] = useState<CartRecommendations>({
        frequentlyBoughtTogether: [],
        youMayAlsoLike: [],
    });
    const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);
    const [addingRecommendations, setAddingRecommendations] = useState(false);
    const [addingProductId, setAddingProductId] = useState<string | null>(null);


    const [email, setEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [selectedAddress, setSelectedAddress] = useState<number>(-1);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [deliveryAddress, setDeliveryAddress] =
        useState<AddressForm>(emptyAddress);

    const [sameBillingAddress, setSameBillingAddress] = useState(true);
    const [billingAddress, setBillingAddress] =
        useState<AddressForm>(emptyAddress);

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const [showAddressForm, setShowAddressForm] = useState(false);

    const token = typeof window !== "undefined" ? getToken() : null;



    // Item subtotal after combo offers (from the server cart pricing).
    const subtotal = useMemo(
        () =>
            Math.round(
                items.reduce((sum, item) => sum + getItemLineTotal(item), 0) * 100
            ) / 100,
        [items]
    );

    const comboSavings = useMemo(
        () =>
            Math.round(
                items.reduce((sum, item) => sum + Number(item.comboDiscount ?? 0), 0) * 100
            ) / 100,
        [items]
    );

    const totalQuantity = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    const shippingCharge = 0;
    const total = subtotal + shippingCharge;

    const authHeaders = useCallback(() => {
        const currentToken = getToken();

        return {
            "Content-Type": "application/json",
            "x-guest-id": getGuestId(),
            ...(currentToken
                ? { Authorization: `Bearer ${currentToken}` }
                : {}),
        };
    }, []);

    const fetchCart = useCallback(async () => {
        const response = await fetch(`${API_URL}/cart`, {
            headers: authHeaders(),
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Unable to load cart");
        }

        const cartItems: CartItem[] = Array.isArray(data.items) ? data.items : [];
        setItems(cartItems);

        // Recommendations are fetched from the existing product APIs.
        // FBT is fetched for every cart product, then deduplicated.
        const cartIds = new Set(
            cartItems.map((item) => item.productId?._id).filter(Boolean)
        );

        const fbtResponses = await Promise.all(
            cartItems
                .filter((item) => item.productId?._id)
                .map(async (item) => {
                    try {
                        const result = await fetch(
                            `${API_URL}/product/frequently-bought-together/${item.productId._id}`,
                            { cache: "no-store" }
                        );
                        if (!result.ok) return [];
                        const payload = await result.json();
                        return Array.isArray(payload.products) ? payload.products : [];
                    } catch {
                        return [];
                    }
                })
        );

        const fbtMap = new Map<string, { product: RecommendedProduct; score?: number }>();
        for (const list of fbtResponses) {
            for (const entry of list) {
                const product = entry?.product || entry?.productId;
                if (!product?._id || cartIds.has(product._id) || product.isActive === false) continue;
                if (typeof product.stock === "number" && product.stock <= 0) continue;
                const existing = fbtMap.get(product._id);
                if (!existing || Number(entry.score || 0) > Number(existing.score || 0)) {
                    fbtMap.set(product._id, { product, score: entry.score });
                }
            }
        }
        const frequentlyBoughtTogether = Array.from(fbtMap.values())
            .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
            .slice(0, 8);

        // Same-category recommendations: query the existing product listing API
        // for each distinct category represented in the cart.
        const categories = Array.from(
            new Set(cartItems.map((item) => item.productId?.category).filter(Boolean))
        ) as string[];

        const fbtIds = new Set(frequentlyBoughtTogether.map((entry) => entry.product._id));
        const youMayAlsoLikeMap = new Map<string, RecommendedProduct>();

        await Promise.all(
            categories.map(async (category) => {
                try {
                    const result = await fetch(
                        `${API_URL}/product?page=1&limit=30&category=${encodeURIComponent(category)}`,
                        { cache: "no-store" }
                    );
                    if (!result.ok) return;
                    const payload = await result.json();
                    const products = Array.isArray(payload)
                        ? payload
                        : Array.isArray(payload.products)
                            ? payload.products
                            : Array.isArray(payload.data?.products)
                                ? payload.data.products
                                : [];

                    for (const product of products) {
                        if (
                            !product?._id ||
                            cartIds.has(product._id) ||
                            fbtIds.has(product._id) ||
                            product.isActive === false ||
                            (typeof product.stock === "number" && product.stock <= 0)
                        ) continue;
                        youMayAlsoLikeMap.set(product._id, product);
                    }
                } catch {
                    // Keep checkout usable if recommendation discovery fails.
                }
            })
        );

        setRecommendations({
            frequentlyBoughtTogether,
            youMayAlsoLike: Array.from(youMayAlsoLikeMap.values()).slice(0, 12),
        });
        setSelectedBundleIds([]);
    }, [authHeaders]);

    const fetchProfile = useCallback(async () => {
        const currentToken = getToken();

        if (!currentToken) return;

        try {
            const response = await fetch(
                `${API_URL}/user/profile/me`,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                }
                return;
            }

            const data: Profile = await response.json();

            setProfile(data);
            setEmail(data.email || "");
            setCustomerPhone(data.number || "");

            const addresses = data.addresses || [];

            if (addresses.length > 0) {
                const defaultIndex = addresses.findIndex(
                    (address) => address.isDefault
                );

                const index = defaultIndex >= 0 ? defaultIndex : 0;

                setSelectedAddress(index);
                setDeliveryAddress({
                    ...emptyAddress,
                    ...addresses[index],
                });
            } else {
                setUseNewAddress(true);
                setShowAddressForm(true);
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        }
    }, []);

    useEffect(() => {
        async function initialize() {
            try {
                setLoading(true);
                await Promise.all([fetchCart(), fetchProfile()]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load checkout"
                );
            } finally {
                setLoading(false);
            }
        }

        initialize();
    }, [fetchCart, fetchProfile]);

    const updateQuantity = async (
        productId: string,
        quantity: number
    ) => {
        try {
            setError("");

            if (quantity < 1) {
                await removeItem(productId);
                return;
            }

            const response = await fetch(
                `${API_URL}/cart/items/${productId}`,
                {
                    method: "PATCH",
                    headers: authHeaders(),
                    body: JSON.stringify({ quantity }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Unable to update quantity");
            }

            await fetchCart();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update cart"
            );
        }
    };

    const removeItem = async (productId: string) => {
        try {
            const response = await fetch(
                `${API_URL}/cart/items/${productId}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Unable to remove item");
            }

            await fetchCart();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to remove item"
            );
        }
    };

    const getRecommendationPrice = (product: RecommendedProduct) =>
        Number(product.sellingPrice ?? product.salePrice ?? product.price ?? 0);

    const toggleBundleProduct = (productId: string) => {
        setSelectedBundleIds((current) =>
            current.includes(productId)
                ? current.filter((id) => id !== productId)
                : [...current, productId]
        );
    };

    const addRecommendedProduct = async (productId: string) => {
        try {
            setAddingProductId(productId);
            setError("");
            const response = await fetch(`${API_URL}/cart/items`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Unable to add product");
            await fetchCart();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to add product");
        } finally {
            setAddingProductId(null);
        }
    };

    const addSelectedBundle = async () => {
        if (!selectedBundleIds.length) return;
        try {
            setAddingRecommendations(true);
            setError("");
            for (const productId of selectedBundleIds) {
                const response = await fetch(`${API_URL}/cart/items`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ productId, quantity: 1 }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data?.message || "Unable to add bundle item");
            }
            await fetchCart();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to add selected products");
        } finally {
            setAddingRecommendations(false);
        }
    };

    const selectedBundleTotal = recommendations.frequentlyBoughtTogether
        .filter((entry) => selectedBundleIds.includes(entry.product._id))
        .reduce((sum, entry) => sum + getRecommendationPrice(entry.product), 0);

    const handleAddressChange = (
        field: keyof AddressForm,
        value: string
    ) => {
        setDeliveryAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleBillingChange = (
        field: keyof AddressForm,
        value: string
    ) => {
        setBillingAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const selectSavedAddress = (index: number) => {
        setSelectedAddress(index);
        setUseNewAddress(false);
        setShowAddressForm(false);

        const address = profile?.addresses?.[index];

        if (address) {
            setDeliveryAddress({
                ...emptyAddress,
                ...address,
            });
        }
    };

    const validateCheckout = () => {
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!/^[6-9]\d{9}$/.test(customerPhone.trim())) {
            return "Please enter a valid 10-digit mobile number.";
        }

        const address = deliveryAddress;

        if (
            !address.fullName.trim() ||
            !address.addressLine1.trim() ||
            !address.city.trim() ||
            !address.state.trim() ||
            !/^\d{6}$/.test(address.pincode.trim()) ||
            !/^[6-9]\d{9}$/.test(address.phone.trim())
        ) {
            return "Please complete all required delivery address fields.";
        }

        if (!sameBillingAddress) {
            if (
                !billingAddress.addressLine1.trim() ||
                !billingAddress.city.trim() ||
                !billingAddress.state.trim() ||
                !/^\d{6}$/.test(billingAddress.pincode.trim())
            ) {
                return "Please complete your billing address.";
            }
        }

        if (!items.length) {
            return "Your cart is empty.";
        }

        return "";
    };

    const placeOrder = async () => {
        if (!paymentMethod) {
            setError("Please select a payment method.");
            return;
        }

        const validationError = validateCheckout();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const nameParts = deliveryAddress.fullName
                .trim()
                .split(/\s+/);

            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ");

            const shipping = {
                address: deliveryAddress.addressLine1,
                apartment: deliveryAddress.addressLine2,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                country: "India",
            };

            const billing = sameBillingAddress
                ? shipping
                : {
                    address: billingAddress.addressLine1,
                    apartment: billingAddress.addressLine2,
                    city: billingAddress.city,
                    state: billingAddress.state,
                    pincode: billingAddress.pincode,
                    country: "India",
                };

            const payload = {
                checkoutRequestId: crypto.randomUUID(),

                customer: {
                    firstName,
                    lastName,
                    email: email.trim(),
                    phone: customerPhone.trim(),
                },

                items: items.map((item) => ({
                    product_id: item.productId._id,
                    qty: item.quantity,
                })),

                // The backend re-prices from the database and rejects (409)
                // the order if this no longer matches, so we never charge a
                // different amount than the one shown.
                expectedSubtotal: subtotal,

                shippingAddress: shipping,
                billingAddress: billing,

                ...(profile?._id
                    ? { userId: profile._id }
                    : {}),

                ...(!profile
                    ? { guestId: getGuestId() }
                    : {}),
            };

            // Where this customer came from (UTM link / campaign page), if known.
            const attribution = getStoredAttribution();
            const orderPayload = attribution
                ? { ...payload, attribution }
                : payload;

            const endpoint =
                paymentMethod === "COD"
                    ? "/payments/create-cod-order"
                    : "/payments/create-order";

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (response.status === 409) {
                // Prices changed: reload the cart so the summary is current.
                await fetchCart().catch(() => undefined);
                throw new Error(
                    data?.message ||
                    "Prices in your cart have changed. Please review your order and try again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data?.message || "Unable to place your order"
                );
            }

            if (paymentMethod === "COD") {
                if (data.status !== "ORDER_PLACED") {
                    throw new Error("Order could not be confirmed.");
                }

                router.push(
                    `/order-success?orderId=${encodeURIComponent(data.orderId)}&orderNumber=${encodeURIComponent(data.orderNumber)}`
                );
                return;
            }

            if (data.payment_url) {
                window.location.href = data.payment_url;
                return;
            }

            throw new Error("Payment URL was not returned by the server.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while placing your order."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#fafafa]">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#071630] border-t-transparent" />
                    <p className="mt-4 text-sm text-gray-500">
                        Preparing your checkout...
                    </p>
                </div>
            </main>
        );
    }

    if (!items.length) {
        return (
            <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fafafa] px-5 text-center">
                <ShoppingBag size={48} className="text-gray-400" />
                <h1 className="mt-5 font-heading text-2xl text-[#071630]">
                    YOUR CART IS EMPTY
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Add something to your cart before checking out.
                </p>
                <button
                    onClick={() => router.push("/shop")}
                    className="mt-6 bg-[#071630] px-7 py-3 text-sm font-semibold text-white"
                >
                    CONTINUE SHOPPING
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] text-[#071630]">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-[1250px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#071630]"
                    >
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">
                            Back to shopping
                        </span>
                    </button>

                    <div className="text-center">
                        <h1 className="font-heading text-xl font-bold tracking-[0.1em] sm:text-2xl">
                            ALPHA MALE
                        </h1>
                        <p className="mt-0.5 text-[10px] tracking-[0.25em] text-gray-500">
                            SECURE CHECKOUT
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#176348]">
                        <LockKeyhole size={15} />
                        <span className="hidden sm:inline">Secure</span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {/* Signed in banner */}
                {profile ? (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce8df] bg-[#f2f8f3] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                <UserRound size={19} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    {profile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {profile.email}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                setProfile(null);
                                setEmail("");
                                setCustomerPhone("");
                                setSelectedAddress(-1);
                                setUseNewAddress(true);
                                setShowAddressForm(true);
                            }}
                            className="text-xs font-semibold text-[#176348] underline"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
                        <div>
                            <p className="text-sm font-semibold">
                                Already have an account?
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Sign in to access your saved addresses.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/user/login")}
                            className="text-xs font-bold text-[#176348] underline"
                        >
                            SIGN IN
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_390px] lg:gap-10">
                    {/* LEFT: CHECKOUT FORM */}
                    <section className="space-y-6">

                        {/* Contact */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071630] text-white">
                                    <UserRound size={17} />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-semibold">
                                        CONTACT INFORMATION
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Where should we send your order updates?
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Email address"
                                    value={email}
                                    onChange={setEmail}
                                    placeholder="you@example.com"
                                    type="email"
                                />
                                <Field
                                    label="Mobile number"
                                    value={customerPhone}
                                    onChange={setCustomerPhone}
                                    placeholder="10-digit mobile number"
                                    type="tel"
                                />
                            </div>
                        </div>

                        {/* Delivery address */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071630] text-white">
                                    <MapPin size={17} />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-semibold">
                                        DELIVERY ADDRESS
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            {profile &&
                                profile.addresses?.length > 0 &&
                                !useNewAddress && (
                                    <div className="space-y-3">
                                        {profile.addresses.map(
                                            (address, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() =>
                                                        selectSavedAddress(index)
                                                    }
                                                    className={`w-full rounded-lg border p-4 text-left transition ${selectedAddress === index
                                                        ? "border-[#176348] bg-[#f3f8f4]"
                                                        : "border-gray-200 hover:border-gray-400"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span
                                                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selectedAddress === index
                                                                ? "border-[#176348] bg-[#176348]"
                                                                : "border-gray-400"
                                                                }`}
                                                        >
                                                            {selectedAddress === index && (
                                                                <Check
                                                                    size={11}
                                                                    className="text-white"
                                                                />
                                                            )}
                                                        </span>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-semibold">
                                                                    {address.fullName}
                                                                </p>
                                                                {address.isDefault && (
                                                                    <span className="rounded bg-[#e5f2e8] px-2 py-0.5 text-[10px] font-bold text-[#176348]">
                                                                        DEFAULT
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                                                {address.addressLine1}
                                                                {address.addressLine2
                                                                    ? `, ${address.addressLine2}`
                                                                    : ""}
                                                                , {address.city},{" "}
                                                                {address.state} -{" "}
                                                                {address.pincode}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {address.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseNewAddress(true);
                                                setShowAddressForm(true);
                                                setSelectedAddress(-1);
                                                setDeliveryAddress(emptyAddress);
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#176348] py-3 text-sm font-semibold text-[#176348] hover:bg-[#f3f8f4]"
                                        >
                                            <Plus size={17} />
                                            ADD NEW ADDRESS
                                        </button>
                                    </div>
                                )}

                            {(!profile ||
                                useNewAddress ||
                                profile.addresses?.length === 0) && (
                                    <div className="space-y-4">
                                        {profile && (
                                            <button
                                                onClick={() => {
                                                    setUseNewAddress(false);
                                                    setShowAddressForm(false);
                                                    if (
                                                        profile.addresses.length > 0
                                                    ) {
                                                        selectSavedAddress(0);
                                                    }
                                                }}
                                                className="mb-1 text-xs font-semibold text-[#176348] underline"
                                            >
                                                ← Back to saved addresses
                                            </button>
                                        )}

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Full name"
                                                value={deliveryAddress.fullName}
                                                onChange={(v) =>
                                                    handleAddressChange("fullName", v)
                                                }
                                                placeholder="Full name"
                                            />
                                            <Field
                                                label="Phone number"
                                                value={deliveryAddress.phone}
                                                onChange={(v) =>
                                                    handleAddressChange("phone", v)
                                                }
                                                placeholder="10-digit mobile number"
                                                type="tel"
                                            />
                                        </div>

                                        <Field
                                            label="Address"
                                            value={deliveryAddress.addressLine1}
                                            onChange={(v) =>
                                                handleAddressChange(
                                                    "addressLine1",
                                                    v
                                                )
                                            }
                                            placeholder="House number, street, area"
                                        />

                                        <Field
                                            label="Apartment, suite, landmark (optional)"
                                            value={deliveryAddress.addressLine2}
                                            onChange={(v) =>
                                                handleAddressChange(
                                                    "addressLine2",
                                                    v
                                                )
                                            }
                                            placeholder="Apartment, landmark"
                                        />

                                        <div className="grid w-full grid-cols-2 gap-4">
                                            <div className="col-span-2 w-full min-w-0">
                                                <LocationSelect
                                                    key={`${deliveryAddress.state}-${deliveryAddress.city}`}
                                                    initialState={deliveryAddress.state}
                                                    initialCity={deliveryAddress.city}
                                                    onChange={({ state, city }) => {
                                                        setDeliveryAddress((previous) => ({
                                                            ...previous,
                                                            state,
                                                            city,
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <Field
                                            label="PIN code"
                                            value={deliveryAddress.pincode}
                                            onChange={(v) =>
                                                handleAddressChange(
                                                    "pincode",
                                                    v.replace(/\D/g, "").slice(0, 6)
                                                )
                                            }
                                            placeholder="6-digit PIN code"
                                            type="text"
                                        />
                                    </div>
                                )}
                        </div>

                        {/* Billing address */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-7">
                            <h2 className="font-heading text-lg font-semibold">
                                BILLING ADDRESS
                            </h2>

                            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={sameBillingAddress}
                                    onChange={(e) =>
                                        setSameBillingAddress(e.target.checked)
                                    }
                                    className="h-4 w-4 accent-[#176348]"
                                />
                                Same as delivery address
                            </label>

                            {!sameBillingAddress && (
                                <div className="mt-5 space-y-4">
                                    <Field
                                        label="Address"
                                        value={billingAddress.addressLine1}
                                        onChange={(v) =>
                                            handleBillingChange(
                                                "addressLine1",
                                                v
                                            )
                                        }
                                        placeholder="House number, street, area"
                                    />
                                    <Field
                                        label="Apartment / Landmark"
                                        value={billingAddress.addressLine2}
                                        onChange={(v) =>
                                            handleBillingChange(
                                                "addressLine2",
                                                v
                                            )
                                        }
                                        placeholder="Optional"
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="City"
                                            value={billingAddress.city}
                                            onChange={(v) =>
                                                handleBillingChange("city", v)
                                            }
                                            placeholder="City"
                                        />
                                        <Field
                                            label="State"
                                            value={billingAddress.state}
                                            onChange={(v) =>
                                                handleBillingChange("state", v)
                                            }
                                            placeholder="State"
                                        />
                                    </div>
                                    <Field
                                        label="PIN code"
                                        value={billingAddress.pincode}
                                        onChange={(v) =>
                                            handleBillingChange(
                                                "pincode",
                                                v.replace(/\D/g, "").slice(0, 6)
                                            )
                                        }
                                        placeholder="6-digit PIN code"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-7">
                            <div className="mb-5">
                                <h2 className="font-heading text-lg font-semibold">
                                    PAYMENT METHOD
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Choose how you want to pay.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {/* <PaymentOption
                                    selected={paymentMethod === "ONLINE"}
                                    onClick={() =>
                                        setPaymentMethod("ONLINE")
                                    }
                                    title="Pay Online"
                                    description="UPI, Credit / Debit Card, Net Banking"
                                    tag="SECURE PAYMENT"
                                /> */}

                                <PaymentOption
                                    selected={paymentMethod === "COD"}
                                    onClick={() => setPaymentMethod("COD")}
                                    title="Cash on Delivery"
                                    description="Pay when your order arrives"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Desktop place order */}
                        <button
                            type="button"
                            onClick={placeOrder}
                            disabled={submitting || !paymentMethod}
                            className="hidden min-h-14 w-full items-center justify-center gap-2 bg-[#071630] px-6 text-sm font-bold tracking-widest text-white transition hover:bg-[#176348] disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
                        >
                            {submitting
                                ? "PROCESSING..."
                                : !paymentMethod
                                    ? "SELECT PAYMENT METHOD"
                                    : paymentMethod === "COD"
                                        ? "PLACE COD ORDER"
                                        : "CONTINUE TO PAYMENT"}
                            <ArrowRight size={18} />
                        </button>
                    </section>

                    {/* RIGHT: ORDER SUMMARY */}
                    <aside className="lg:sticky lg:top-6">
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                <h2 className="font-heading text-lg font-semibold">
                                    ORDER SUMMARY
                                </h2>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                    {totalQuantity} ITEMS
                                </span>
                            </div>

                            <div className="space-y-5 p-5">
                                {items.map((item) => {
                                    const product = item.productId;

                                    if (!product?._id) return null;

                                    return (
                                        <div
                                            key={product._id}
                                            className="flex gap-3"
                                        >
                                            <div className="relative h-[76px] w-[68px] shrink-0 overflow-hidden rounded-md bg-gray-50">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="68px"
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                                )}

                                                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#071630] px-1 text-[10px] font-bold text-white">
                                                    {item.quantity}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-semibold">
                                                    {product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatPrice(getItemUnitPrice(item))}
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                product._id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        disabled={item.quantity <= 1}
                                                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 disabled:opacity-30"
                                                    >
                                                        <Minus size={12} />
                                                    </button>

                                                    <span className="text-xs font-semibold">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                product._id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        disabled={
                                                            typeof product.stock === "number" &&
                                                            item.quantity >= product.stock
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 disabled:opacity-30"
                                                    >
                                                        <Plus size={12} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            removeItem(product._id)
                                                        }
                                                        className="ml-auto text-gray-400 hover:text-red-600"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                {Number(item.comboDiscount ?? 0) > 0 && (
                                                    <p className="text-[10px] text-gray-400 line-through">
                                                        {formatPrice(getItemUnitPrice(item) * item.quantity)}
                                                    </p>
                                                )}
                                                <p className="text-sm font-semibold">
                                                    {formatPrice(getItemLineTotal(item))}
                                                </p>
                                                {Number(item.comboDiscount ?? 0) > 0 && (
                                                    <p className="text-[10px] font-semibold text-[#176348]">
                                                        Combo offer applied
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* FREQUENTLY BOUGHT TOGETHER */}
                            {recommendations.frequentlyBoughtTogether.length > 0 && (
                                <section className="mx-4 mb-4 rounded-xl border border-gray-200 bg-white p-3 sm:mx-5">
                                    <h3 className="text-sm font-bold text-[#071630]">Frequently bought together</h3>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        Often ordered with {items[0]?.productId?.name || "your items"}
                                    </p>

                                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#f3f5f8] p-3">
                                        {items[0]?.productId?.images?.[0] && (
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#071630] bg-white">
                                                <Image src={items[0].productId.images[0]} alt={items[0].productId.name} fill sizes="48px" className="object-contain p-1" />
                                            </div>
                                        )}
                                        {recommendations.frequentlyBoughtTogether
                                            .filter((entry) => selectedBundleIds.includes(entry.product._id))
                                            .slice(0, 2)
                                            .map(({ product }) => (
                                                <div key={product._id} className="flex items-center gap-2">
                                                    <span className="text-sm font-bold">+</span>
                                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#071630] bg-white">
                                                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name || product.title || "Product"} fill sizes="48px" className="object-contain p-1" />}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        {recommendations.frequentlyBoughtTogether.map(({ product }) => (
                                            <label key={product._id} className="flex cursor-pointer items-center gap-2">
                                                <input type="checkbox" checked={selectedBundleIds.includes(product._id)} onChange={() => toggleBundleProduct(product._id)} className="h-4 w-4 accent-[#071630]" />
                                                <span className="min-w-0 flex-1 text-xs text-[#071630]">{product.name || product.title}</span>
                                                <span className="shrink-0 text-xs font-bold">{formatPrice(getRecommendationPrice(product))}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Add {selectedBundleIds.length} items</p>
                                            <p className="text-sm font-bold text-[#071630]">{formatPrice(selectedBundleTotal)}</p>
                                        </div>
                                        <button type="button" onClick={addSelectedBundle} disabled={!selectedBundleIds.length || addingRecommendations} className="rounded-lg bg-[#071630] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
                                            {addingRecommendations ? "Adding..." : "Add to order"}
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* YOU MAY ALSO LIKE */}
                            {recommendations.youMayAlsoLike.length > 0 && (
                                <section className="mx-4 mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white sm:mx-5">
                                    <div className="px-3 pb-2 pt-3">
                                        <h3 className="text-sm font-bold text-[#071630]">You may also like</h3>
                                    </div>
                                    <div className="overflow-x-auto px-3 pb-3">
                                        <div className="flex w-max gap-2">
                                            {recommendations.youMayAlsoLike.map((product) => {
                                                const price = getRecommendationPrice(product);
                                                const comparePrice = Number(product.compareAtPrice || 0);
                                                const discount = comparePrice > price && price > 0
                                                    ? Math.round(((comparePrice - price) / comparePrice) * 100)
                                                    : Number(product.discountPercentage || 0);
                                                return (
                                                    <article key={product._id} className="w-[140px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                                        <div className="relative flex h-[98px] items-center justify-center bg-[#edf0f5]">
                                                            {discount > 0 && <span className="absolute left-1 top-1 z-10 rounded bg-[#071630] px-1.5 py-0.5 text-[8px] font-bold text-white">{discount}% OFF</span>}
                                                            {product.images?.[0] && <Image src={product.images[0]} alt={product.name || product.title || "Product"} fill sizes="116px" className="object-contain p-2" />}
                                                        </div>
                                                        <div className="p-2">
                                                            <p className="line-clamp-2 min-h-[30px] text-[10px] font-semibold leading-4 text-[#071630]">{product.name || product.title}</p>
                                                            <div className="mt-1.5 flex flex-col gap-1.5">
                                                                <span className="text-xs font-bold text-[#071630]">{formatPrice(price)}</span>
                                                                <button type="button" onClick={() => addRecommendedProduct(product._id)} disabled={addingProductId === product._id} className="flex h-9 w-full items-center justify-center whitespace-nowrap rounded-lg border border-[#071630] text-[10px] font-bold text-[#071630] transition-colors hover:bg-[#071630] hover:text-white disabled:opacity-50">
                                                                    {addingProductId === product._id ? "..." : "+ Add"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <div className="border-t border-gray-200 px-5 py-5">
                                <div className="space-y-3 text-sm">
                                    {comboSavings > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Items total</span>
                                            <span>{formatPrice(subtotal + comboSavings)}</span>
                                        </div>
                                    )}

                                    {comboSavings > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Combo savings</span>
                                            <span className="text-[#176348]">
                                                - {formatPrice(comboSavings)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-[#176348]">
                                            {shippingCharge === 0
                                                ? "Free"
                                                : formatPrice(shippingCharge)}
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-[#071630]">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-right text-[10px] text-gray-400">
                                            Inclusive of applicable taxes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 bg-[#f8faf8] px-5 py-4">
                                <div className="flex items-center gap-2 text-xs text-[#176348]">
                                    <ShieldCheck size={17} />
                                    <span>
                                        Your information is protected with secure checkout.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile place order */}
                    <div className="lg:hidden">
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={placeOrder}
                            disabled={submitting || !paymentMethod}
                            className="flex min-h-14 w-full items-center justify-center gap-2 bg-[#071630] px-6 text-sm font-bold tracking-widest text-white transition hover:bg-[#176348] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? "PROCESSING..."
                                : !paymentMethod
                                    ? "SELECT PAYMENT METHOD"
                                    : paymentMethod === "COD"
                                        ? "PLACE COD ORDER"
                                        : "CONTINUE TO PAYMENT"}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* Reusable input field */
function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-700">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-[#071630] outline-none transition placeholder:text-gray-400 focus:border-[#176348] focus:ring-1 focus:ring-[#176348]"
            />
        </label>
    );
}

/* Payment method option */
function PaymentOption({
    selected,
    onClick,
    title,
    description,
    tag,
}: {
    selected: boolean;
    onClick: () => void;
    title: string;
    description: string;
    tag?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${selected
                ? "border-[#176348] bg-[#f3f8f4]"
                : "border-gray-200 hover:border-gray-400"
                }`}
        >
            <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                    ? "border-[#176348] bg-[#176348]"
                    : "border-gray-400"
                    }`}
            >
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{title}</span>
                    {tag && (
                        <span className="rounded bg-[#e5f2e8] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#176348]">
                            {tag}
                        </span>
                    )}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                    {description}
                </span>
            </span>
        </button>
    );
}
