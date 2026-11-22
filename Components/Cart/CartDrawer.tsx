
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
    Minus,
    Plus,
    Trash2,
    X,
    ShoppingBag,
    ArrowRight,
    Check,
    Loader2,
    Sparkles,
} from "lucide-react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// ------------------------------------------
// TYPES
// ------------------------------------------

type CartProduct = {
    _id: string;
    name: string;
    title?: string;
    price: number;
    compareAtPrice?: number | null;
    salePrice?: number;
    sellingPrice?: number;
    images?: string[];
    image?: string;
    stock?: number;
    category?: string;
    isActive?: boolean;
};

type CartApiItem = {
    productId: CartProduct;
    quantity: number;
    price: number;
    // Server-computed (GET /cart) with combo offers applied.
    unitPrice?: number;
    regularTotal?: number;
    lineTotal?: number;
    comboDiscount?: number;
};

/** Unit price: server value, else the current product price. */
function getItemUnitPrice(item: CartApiItem) {
    return Number(item.unitPrice ?? item.productId?.price ?? item.price ?? 0);
}

/** Line total with combo offers, as charged at checkout. */
function getItemLineTotal(item: CartApiItem) {
    return Number(item.lineTotal ?? getItemUnitPrice(item) * item.quantity);
}

type FrequentlyBoughtProduct = {
    product: CartProduct;
    score?: number;
    purchaseCount?: number;
    confidence?: number;
    lift?: number;
};

type CartRecommendations = {
    frequentlyBoughtTogether: FrequentlyBoughtProduct[];
    youMayAlsoLike: CartProduct[];
};

type CartDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
    recommendations?: CartProduct[];
    onAddItem?: (product: CartProduct) => void;
};

// ------------------------------------------
// HELPERS
// ------------------------------------------

function getGuestId() {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
        guestId = `guest_${crypto.randomUUID()}`;
        localStorage.setItem("guestId", guestId);
    }

    return guestId;
}

async function cartRequest(
    endpoint: string,
    method = "GET",
    body?: object
) {
    const token = localStorage.getItem("token");
    const guestId = getGuestId();

    const response = await fetch(`${API_URL}/cart${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "x-guest-id": guestId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message || "Unable to update your cart. Please try again."
        );
    }

    return data;
}

function getProductImage(product: CartProduct) {
    return product.images?.[0] || product.image || "";
}

function getProductPrice(product: CartProduct) {
    return (
        product.sellingPrice ??
        product.salePrice ??
        product.price ??
        0
    );
}

function formatPrice(price: number) {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

// ------------------------------------------
// COMPONENT
// ------------------------------------------

export default function CartDrawer({
    isOpen,
    onClose,
    onCheckout,
    recommendations = [],
    onAddItem,
}: CartDrawerProps) {
    const [items, setItems] = useState<CartApiItem[]>([]);
    const [cartRecommendations, setCartRecommendations] =
        useState<CartRecommendations>({
            frequentlyBoughtTogether: [],
            youMayAlsoLike: [],
        });

    const [loading, setLoading] = useState(false);
    const [busyProductId, setBusyProductId] = useState<string | null>(null);
    const [addingProductId, setAddingProductId] = useState<string | null>(null);
    const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState("");

    // ------------------------------------------
    // FETCH CART
    // ------------------------------------------

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await cartRequest("");

            setItems(Array.isArray(data?.items) ? data.items : []);

            setCartRecommendations({
                frequentlyBoughtTogether: Array.isArray(
                    data?.recommendations?.frequentlyBoughtTogether
                )
                    ? data.recommendations.frequentlyBoughtTogether
                    : [],

                youMayAlsoLike: Array.isArray(
                    data?.recommendations?.youMayAlsoLike
                )
                    ? data.recommendations.youMayAlsoLike
                    : [],
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen, fetchCart]);

    // Refresh when another component updates cart
    useEffect(() => {
        if (!isOpen) return;

        const handleCartUpdated = () => {
            fetchCart();
        };

        window.addEventListener("cart-updated", handleCartUpdated);

        return () => {
            window.removeEventListener("cart-updated", handleCartUpdated);
        };
    }, [isOpen, fetchCart]);

    // ------------------------------------------
    // ESCAPE + BODY SCROLL
    // ------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    // ------------------------------------------
    // UPDATE QUANTITY
    // ------------------------------------------

    const updateQuantity = async (
        productId: string,
        quantity: number
    ) => {
        if (quantity < 1) return;

        try {
            setBusyProductId(productId);
            setError("");

            await cartRequest(`/items/${productId}`, "PATCH", {
                quantity,
            });

            await fetchCart();

            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update quantity."
            );
        } finally {
            setBusyProductId(null);
        }
    };

    // ------------------------------------------
    // REMOVE ITEM
    // ------------------------------------------

    const removeItem = async (productId: string) => {
        try {
            setBusyProductId(productId);
            setError("");

            await cartRequest(`/items/${productId}`, "DELETE");

            await fetchCart();

            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to remove product."
            );
        } finally {
            setBusyProductId(null);
        }
    };

    // ------------------------------------------
    // CLEAR CART
    // ------------------------------------------

    const clearCart = async () => {
        if (!items.length) return;

        try {
            setClearing(true);
            setError("");

            await cartRequest("", "DELETE");

            setItems([]);
            setCartRecommendations({
                frequentlyBoughtTogether: [],
                youMayAlsoLike: [],
            });

            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to clear your cart."
            );
        } finally {
            setClearing(false);
        }
    };

    // ------------------------------------------
    // ADD RECOMMENDED PRODUCT
    // ------------------------------------------

    const addRecommendedProduct = async (product: CartProduct) => {
        if (!product?._id) return;

        try {
            setAddingProductId(product._id);
            setError("");

            // Use existing parent callback if supplied.
            if (onAddItem) {
                await onAddItem(product);
            } else {
                await cartRequest("/items", "POST", {
                    productId: product._id,
                    quantity: 1,
                });
            }

            setAddedProductIds((previous) =>
                previous.includes(product._id)
                    ? previous
                    : [...previous, product._id]
            );

            await fetchCart();

            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to add this product."
            );
        } finally {
            setAddingProductId(null);
        }
    };

    // ------------------------------------------
    // TOTALS
    // ------------------------------------------

    const subtotal = items.reduce(
        (total, item) => total + getItemLineTotal(item),
        0
    );

    const comboSavings = items.reduce(
        (total, item) => total + Number(item.comboDiscount ?? 0),
        0
    );

    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // ------------------------------------------
    // RECOMMENDATION FILTERING
    // ------------------------------------------

    const cartProductIds = useMemo(
        () =>
            new Set(
                items
                    .map((item) => item.productId?._id)
                    .filter(Boolean)
            ),
        [items]
    );

    const frequentlyBoughtProducts = useMemo(() => {
        const unique = new Map<string, FrequentlyBoughtProduct>();

        for (const item of cartRecommendations.frequentlyBoughtTogether) {
            const product = item?.product;

            if (!product?._id) continue;
            if (cartProductIds.has(product._id)) continue;
            if (product.isActive === false) continue;
            if (product.stock != null && product.stock <= 0) continue;

            const existing = unique.get(product._id);

            if (existing) {
                existing.score =
                    Number(existing.score || 0) +
                    Number(item.score || 0);
            } else {
                unique.set(product._id, item);
            }
        }

        return Array.from(unique.values())
            .sort(
                (a, b) =>
                    Number(b.score || 0) - Number(a.score || 0)
            )
            .slice(0, 8);
    }, [cartRecommendations.frequentlyBoughtTogether, cartProductIds]);

    const youMayAlsoLikeProducts = useMemo(() => {
        const excludedIds = new Set([
            ...cartProductIds,
            ...frequentlyBoughtProducts.map(
                (item) => item.product._id
            ),
        ]);

        // API recommendations take priority.
        // The prop is retained for backward compatibility.
        const source =
            cartRecommendations.youMayAlsoLike.length > 0
                ? cartRecommendations.youMayAlsoLike
                : recommendations;

        const unique = new Map<string, CartProduct>();

        for (const product of source) {
            if (!product?._id) continue;
            if (excludedIds.has(product._id)) continue;
            if (product.isActive === false) continue;
            if (product.stock != null && product.stock <= 0) continue;

            unique.set(product._id, product);
        }

        return Array.from(unique.values()).slice(0, 8);
    }, [
        cartRecommendations.youMayAlsoLike,
        recommendations,
        cartProductIds,
        frequentlyBoughtProducts,
    ]);

    if (!isOpen) return null;

    // ------------------------------------------
    // RECOMMENDATION CARD
    // ------------------------------------------


    const renderRecommendation = (product: CartProduct) => {
        const image = getProductImage(product);
        const price = getProductPrice(product);
        const isAdding = addingProductId === product._id;
        const isAdded = addedProductIds.includes(product._id);

        return (
            <div
                key={product._id}
                className="w-[190px] min-w-[190px] shrink-0 overflow-hidden rounded-[20px] border border-[#dfe5ee] bg-white"
            >
                {/* PRODUCT IMAGE */}
                <div className="relative flex h-[128px] w-full items-center justify-center overflow-hidden bg-[#edf0f5]">
                    {image ? (
                        <Image
                            src={image}
                            alt={product.name || product.title || "Product"}
                            fill
                            sizes="190px"
                            className="object-contain p-3"
                        />
                    ) : (
                        <ShoppingBag
                            size={32}
                            className="text-[#91857b]"
                        />
                    )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="flex min-h-[112px] flex-col p-3">
                    <p className="line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-[19px] text-[#071630]">
                        {product.name || product.title}
                    </p>

                    {/* PRICE + ADD BUTTON */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="whitespace-nowrap text-sm font-bold text-[#071630]">
                            {formatPrice(price)}
                        </span>

                        <button
                            type="button"
                            onClick={() => addRecommendedProduct(product)}
                            disabled={isAdding || isAdded || clearing}
                            className={`flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#071630] px-3 text-xs font-semibold transition ${isAdded
                                    ? "border-[#176348] bg-[#176348] text-white"
                                    : "bg-white text-[#071630] hover:bg-[#071630] hover:text-white"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            {isAdding ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : isAdded ? (
                                <Check size={12} />
                            ) : (
                                <Plus size={12} />
                            )}

                            {isAdding ? "Adding" : isAdded ? "Added" : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    // ------------------------------------------
    // RENDER
    // ------------------------------------------

    return (
        <div className="fixed inset-0 z-[100]">
            {/* BACKDROP */}
            <button
                type="button"
                aria-label="Close cart"
                onClick={onClose}
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            />

            {/* DRAWER */}
            <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden bg-[#faf7f2] shadow-2xl">
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#e8e1d8] px-5 py-4 sm:px-7 sm:py-5">
                    <div>
                        <h2 className="font-heading text-xl font-semibold tracking-wide text-[#071630]">
                            YOUR CART
                        </h2>

                        <p className="mt-1 text-[10px] font-medium tracking-widest text-[#91857b]">
                            {totalQuantity}{" "}
                            {totalQuantity === 1 ? "ITEM" : "ITEMS"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close cart"
                        className="rounded-full p-2 text-[#071630] transition hover:bg-[#eee8df]"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mx-5 mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 sm:mx-7">
                        {error}
                    </div>
                )}

                {/* CONTENT */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                    {loading && items.length === 0 ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2
                                size={30}
                                className="animate-spin text-[#176348]"
                            />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eee8df]">
                                <ShoppingBag
                                    size={34}
                                    className="text-[#91857b]"
                                />
                            </div>

                            <h3 className="mt-5 font-heading text-lg text-[#071630]">
                                YOUR CART IS EMPTY
                            </h3>

                            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#91857b]">
                                Looks like you haven't added anything to
                                your cart yet.
                            </p>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 min-h-11 bg-[#071630] px-7 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-[#176348]"
                            >
                                CONTINUE SHOPPING
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* CART ITEMS HEADER */}
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#91857b]">
                                    CART ITEMS
                                </p>

                                <button
                                    type="button"
                                    onClick={clearCart}
                                    disabled={clearing || !!busyProductId}
                                    className="text-xs font-medium text-red-600 underline underline-offset-4 disabled:opacity-40"
                                >
                                    {clearing ? "Clearing..." : "Clear cart"}
                                </button>
                            </div>

                            {/* CART PRODUCTS */}
                            <div className="space-y-5">
                                {items.map((item) => {
                                    const product = item.productId;

                                    if (!product?._id) return null;

                                    const image = getProductImage(product);
                                    const isBusy =
                                        busyProductId === product._id;

                                    const itemPrice = getItemUnitPrice(item);
                                    const lineTotal = getItemLineTotal(item);
                                    const lineSaving = Number(item.comboDiscount ?? 0);

                                    return (
                                        <div
                                            key={product._id}
                                            className="flex gap-3 border-b border-[#e8e1d8] pb-5 sm:gap-4"
                                        >
                                            {/* IMAGE */}
                                            <div className="relative h-[105px] w-[85px] shrink-0 overflow-hidden rounded-lg bg-white sm:h-[115px] sm:w-[95px]">
                                                {image ? (
                                                    <Image
                                                        src={image}
                                                        alt={product.name}
                                                        fill
                                                        sizes="95px"
                                                        className="object-contain p-2"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <ShoppingBag className="text-[#b7aa9d]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* DETAILS */}
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#071630]">
                                                        {product.name}
                                                    </h3>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                product._id
                                                            )
                                                        }
                                                        disabled={
                                                            isBusy || clearing
                                                        }
                                                        aria-label={`Remove ${product.name}`}
                                                        className="shrink-0 rounded-md p-1 text-[#91857b] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>

                                                <p className="mt-2 text-sm font-bold text-[#176348]">
                                                    {formatPrice(itemPrice)}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                                    {/* QUANTITY */}
                                                    <div className="flex h-9 items-center rounded-md border border-[#d9d0c6] bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product._id,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            disabled={
                                                                isBusy ||
                                                                clearing ||
                                                                item.quantity <= 1
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center text-[#071630] hover:bg-[#eee8df] disabled:opacity-30"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={13} />
                                                        </button>

                                                        <span className="flex h-8 min-w-8 items-center justify-center text-xs font-semibold text-[#071630]">
                                                            {isBusy
                                                                ? "..."
                                                                : item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product._id,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            disabled={
                                                                isBusy ||
                                                                clearing ||
                                                                (typeof product.stock === "number" &&
                                                                    item.quantity >= product.stock)
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center text-[#071630] hover:bg-[#eee8df] disabled:opacity-30"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        {lineSaving > 0 && (
                                                            <p className="text-[10px] text-[#91857b] line-through">
                                                                {formatPrice(itemPrice * item.quantity)}
                                                            </p>
                                                        )}
                                                        <p className="text-sm font-bold text-[#071630]">
                                                            {formatPrice(lineTotal)}
                                                        </p>
                                                        {lineSaving > 0 && (
                                                            <p className="text-[10px] font-semibold text-[#176348]">
                                                                Combo saves {formatPrice(lineSaving)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* FREQUENTLY BOUGHT TOGETHER */}

                            {/* FREQUENTLY BOUGHT TOGETHER */}

                            {/* FREQUENTLY BOUGHT TOGETHER */}
                            {frequentlyBoughtProducts.length > 0 && (
                                <section className="mt-5 border-t border-[#e8e1d8] pt-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-bold text-[#071630]">
                                                Frequently bought together
                                            </h3>
                                            <p className="mt-0.5 text-[10px] text-[#91857b]">
                                                Often purchased with your items
                                            </p>
                                        </div>
                                    </div>

                                    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7">
                                        <div className="flex gap-2.5">
                                            {frequentlyBoughtProducts.map((item) => {
                                                const product = item.product;
                                                const image = getProductImage(product);
                                                const price = getProductPrice(product);
                                                const isAdding = addingProductId === product._id;
                                                const isAdded = addedProductIds.includes(product._id);

                                                return (
                                                    <div
                                                        key={product._id}
                                                        className="w-[88px] min-w-[88px] shrink-0"
                                                    >
                                                        {/* PRODUCT IMAGE */}
                                                        <div className="relative flex h-[82px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#edf0f4]">
                                                            {image ? (
                                                                <Image
                                                                    src={image}
                                                                    alt={product.name || product.title || "Product"}
                                                                    fill
                                                                    sizes="88px"
                                                                    className="object-contain p-2"
                                                                />
                                                            ) : (
                                                                <ShoppingBag
                                                                    size={22}
                                                                    className="text-[#91857b]"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* PRODUCT NAME */}
                                                        <p className="mt-1.5 line-clamp-2 min-h-[28px] text-[10px] font-semibold leading-[14px] text-[#071630]">
                                                            {product.name || product.title}
                                                        </p>

                                                        {/* PRICE + ADD */}
                                                        <div className="mt-1.5 flex items-center justify-between gap-1">
                                                            <span className="text-[10px] font-semibold text-[#071630]">
                                                                {formatPrice(price)}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => addRecommendedProduct(product)}
                                                                disabled={isAdding || isAdded || clearing}
                                                                className={`flex h-[23px] min-w-[34px] items-center justify-center gap-0.5 rounded-full border border-[#071630] px-1.5 text-[9px] font-semibold whitespace-nowrap transition disabled:opacity-60 ${isAdded
                                                                    ? "border-[#176348] bg-[#176348] text-white"
                                                                    : "bg-white text-[#071630] hover:bg-[#071630] hover:text-white"
                                                                    }`}
                                                            >
                                                                {isAdding ? (
                                                                    <Loader2 size={10} className="animate-spin" />
                                                                ) : isAdded ? (
                                                                    <Check size={10} />
                                                                ) : (
                                                                    <Plus size={10} />
                                                                )}

                                                                {isAdded ? "Added" : "Add"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}



                            {/* YOU MAY ALSO LIKE */}
                            {youMayAlsoLikeProducts.length > 0 && (
                                <section className="mt-7 border-t border-[#e8e1d8] pt-6">
                                    <div className="mb-3">
                                        <h3 className="font-heading text-sm font-semibold tracking-wide text-[#071630]">
                                            YOU MAY ALSO LIKE
                                        </h3>

                                        <p className="mt-1 text-[10px] text-[#91857b]">
                                            More products selected for you
                                        </p>
                                    </div>

                                    <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:-mx-7 sm:px-7">
                                        <div className="flex gap-3">
                                            {youMayAlsoLikeProducts.map(
                                                (product) =>
                                                    renderRecommendation(
                                                        product
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <p className="pb-3 pt-5 text-center text-[10px] tracking-wide text-[#91857b]">
                                YOU'RE ONE STEP CLOSER TO YOUR ORDER
                            </p>
                        </>
                    )}
                </div>

                {/* STICKY FOOTER */}
                {items.length > 0 && (
                    <div className="shrink-0 border-t border-[#e8e1d8] bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pt-5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-[#91857b]">
                                Subtotal ({totalQuantity} items)
                            </span>

                            <span className="text-lg font-bold text-[#071630]">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        {comboSavings > 0 && (
                            <p className="mb-1 text-right text-xs font-semibold text-[#176348]">
                                Combo savings {formatPrice(comboSavings)}
                            </p>
                        )}

                        <p className="mb-4 text-[10px] leading-4 text-[#91857b]">
                            Shipping and discounts are calculated at checkout.
                        </p>

                        <button
                            type="button"
                            onClick={onCheckout}
                            disabled={
                                loading ||
                                clearing ||
                                !!busyProductId ||
                                !!addingProductId
                            }
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#071630] px-5 py-3 text-xs font-bold tracking-[0.15em] text-white transition hover:bg-[#176348] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            PROCEED TO CHECKOUT
                            <ArrowRight size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-2 min-h-9 w-full py-2 text-center text-[10px] font-semibold tracking-widest text-[#91857b] underline underline-offset-4"
                        >
                            CONTINUE SHOPPING
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
}
