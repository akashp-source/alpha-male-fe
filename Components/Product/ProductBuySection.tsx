
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart";
import ProductGallery from "./ProductGallery";
import RichDescription from "./RichDescription";
import {
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Zap,
    Check,
    ShieldCheck,
    Package,
    RefreshCcw,
    ChevronRight,
} from "lucide-react";

interface ProductBuySectionProps {
    product: Product;
    onAddToCart?: (
        product: Product,
        quantity: number,
        totalPrice: number
    ) => void;
    onBuyNow?: (
        product: Product,
        quantity: number,
        totalPrice: number
    ) => void;
}

export default function ProductBuySection({
    product,
    onAddToCart,
    onBuyNow,
}: ProductBuySectionProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [pending, setPending] = useState<"cart" | "buy" | null>(null);
    const [cartError, setCartError] = useState("");

    // -----------------------------------
    // Pricing calculation
    // Quantity is the single source of truth
    // -----------------------------------

    const activeCombo =
        product.comboOffers?.find(
            (offer) => offer.quantity === quantity
        ) ?? null;

    const totalPrice = activeCombo
        ? activeCombo.offerPrice
        : product.price * quantity;

    const originalPrice = product.price * quantity;

    const savings = Math.max(0, originalPrice - totalPrice);

    const discountPercentage =
        product.compareAtPrice &&
            product.compareAtPrice > product.price
            ? Math.round(
                ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                100
            )
            : 0;

    const outOfStock = product.stock <= 0;

    const formatPrice = (price: number) =>
        `₹${price.toLocaleString("en-IN")}`;

    // -----------------------------------
    // Add to cart / Buy now
    // Callers may override via onAddToCart / onBuyNow; otherwise the item is
    // added to the cart through the cart API.
    // -----------------------------------

    const handleAddToCart = async () => {
        if (onAddToCart) return onAddToCart(product, quantity, totalPrice);
        if (pending || outOfStock) return;

        setPending("cart");
        setCartError("");
        try {
            await addToCart(product._id, quantity);
            // Show the updated cart (the navbar listens for this event).
            window.dispatchEvent(new Event("open-cart"));
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to add to cart");
        } finally {
            setPending(null);
        }
    };

    const handleBuyNow = async () => {
        if (onBuyNow) return onBuyNow(product, quantity, totalPrice);
        if (pending || outOfStock) return;

        setPending("buy");
        setCartError("");
        try {
            await addToCart(product._id, quantity);
            router.push("/checkout");
            // Keep the spinner while the checkout page loads.
        } catch (error) {
            setCartError(error instanceof Error ? error.message : "Unable to start checkout");
            setPending(null);
        }
    };

    // -----------------------------------
    // Quantity update
    // -----------------------------------

    const updateQuantity = (value: number) => {
        setQuantity(
            Math.max(1, Math.min(value, product.stock))
        );
    };

    // -----------------------------------
    // Combo selection
    // Click selected combo again to reset
    // -----------------------------------

    const selectCombo = (offerQuantity: number) => {
        if (quantity === offerQuantity) {
            setQuantity(1);
            return;
        }

        if (offerQuantity <= product.stock) {
            setQuantity(offerQuantity);
        }
    };

    return (
        <section className="w-full bg-[#faf7f2] text-[#211b17]">
            <div className="pdp-container py-4 sm:py-5 lg:py-6">

                {/* Breadcrumb */}
                <nav className="mb-4 flex min-w-0 flex-wrap items-center gap-2 font-body text-xs text-[#968a80] sm:mb-5 sm:text-sm">
                    <a
                        href="/"
                        className="transition hover:text-[#176348]"
                    >
                        Home
                    </a>

                    <ChevronRight size={13} />

                    <a
                        href="/products"
                        className="transition hover:text-[#176348]"
                    >
                        Shop
                    </a>

                    <ChevronRight size={13} />

                    <span className="min-w-0 break-words font-medium uppercase text-[#211b17]">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">

                    {/* LEFT: Product Images */}
                    <div className="w-full min-w-0 lg:sticky lg:top-[92px]">
                        {/* Swipe on phone; click + ← → on desktop */}
                        <ProductGallery images={product.images ?? []} name={product.name} />
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="flex min-w-0 flex-col">

                        {/* Category */}
                        <p className="order-1 mb-1 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#176348] sm:text-xs">
                            {product.category}
                        </p>

                        {/* Product Name */}
                        <h1 className="order-1 break-words font-heading text-[25px] font-bold uppercase leading-[1.2] tracking-wide sm:text-3xl lg:text-[34px]">
                            {product.name}
                        </h1>

                        {/* Description: bullet lines ("- ", "• ", "* ") render as points */}
                        <RichDescription
                            text={product.description}
                            className="order-8 mt-3 font-body text-xs leading-6 text-[#8b8077] sm:text-sm md:order-2"
                        />

                        {/* Product Price */}
                        <div className="order-2 mt-1 flex flex-wrap items-center gap-2.5 sm:mt-2 lg:mt-1">
                            <span className="font-body text-[27px] font-bold tracking-tight sm:text-3xl">
                                {formatPrice(product.price)}
                            </span>

                            {product.compareAtPrice &&
                                product.compareAtPrice > product.price && (
                                    <>
                                        <span className="font-body text-sm text-[#a69a90] line-through sm:text-base">
                                            {formatPrice(
                                                product.compareAtPrice
                                            )}
                                        </span>

                                        <span className="rounded-md bg-[#e5f1e9] px-2.5 py-1 font-body text-[10px] font-bold text-[#176348] sm:text-xs">
                                            {discountPercentage}% OFF
                                        </span>
                                    </>
                                )}
                        </div>

                        <p className="order-2 mt-0.5 font-body text-[10px] text-[#9a8e84] sm:text-xs">
                            Inclusive of all taxes
                        </p>

                        {/* Quantity Selector */}
                        <div className="order-3 mt-2 flex flex-wrap items-center gap-3 lg:mt-2">
                            <div className="flex h-11 items-center rounded-lg border border-[#e3d9ce] bg-white sm:h-12">

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateQuantity(quantity - 1)
                                    }
                                    disabled={
                                        quantity <= 1 || outOfStock
                                    }
                                    aria-label="Decrease quantity"
                                    className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                                >
                                    <Minus size={14} />
                                </button>

                                <span className="min-w-7 text-center font-body text-sm font-medium">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateQuantity(quantity + 1)
                                    }
                                    disabled={
                                        quantity >= product.stock
                                    }
                                    aria-label="Increase quantity"
                                    className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <span
                                className={`font-body text-xs ${outOfStock
                                    ? "text-red-600"
                                    : "text-[#8b8077]"
                                    }`}
                            >
                                {outOfStock
                                    ? "Out of stock"
                                    : `${product.stock} available`}
                            </span>
                        </div>

                        {/* Combo Offers */}
                        {product.comboOffers?.length > 0 && (
                            <div className="order-4 mt-2 sm:mt-3 lg:mt-2">

                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div>
                                        <h2 className="font-heading text-base font-bold sm:text-lg">
                                            Special Combo Offers
                                        </h2>

                                        <p className="mt-1 font-body text-[11px] text-[#94877d] sm:text-xs">
                                            Buy more and save more
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[#e5f1e9] px-3 py-1 font-body text-[9px] font-bold uppercase tracking-wider text-[#176348] sm:text-[10px]">
                                        Best Deals
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">

                                    {product.comboOffers.map(
                                        (offer, index) => {
                                            const isSelected =
                                                quantity === offer.quantity;

                                            const regularPrice =
                                                product.price *
                                                offer.quantity;

                                            const offerSavings =
                                                Math.max(
                                                    0,
                                                    regularPrice -
                                                    offer.offerPrice
                                                );

                                            const exceedsStock =
                                                offer.quantity >
                                                product.stock;

                                            return (
                                                <button
                                                    type="button"
                                                    key={index}
                                                    disabled={exceedsStock}
                                                    onClick={() =>
                                                        selectCombo(
                                                            offer.quantity
                                                        )
                                                    }
                                                    className={`relative min-w-0 rounded-xl border p-2 text-left transition-all sm:p-2.5 ${isSelected
                                                        ? "border-[#176348] bg-[#edf5ef] ring-1 ring-[#176348]"
                                                        : "border-[#e5dcd2] bg-white hover:border-[#176348]"
                                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                                >
                                                    {isSelected && (
                                                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#176348] text-white">
                                                            <Check size={12} />
                                                        </span>
                                                    )}

                                                    <p className="break-words pr-5 font-body text-[11px] font-bold leading-snug sm:text-sm">
                                                        {offer.title ||
                                                            `Buy ${offer.quantity} Packs`}
                                                    </p>

                                                    {offer.description && (
                                                        <p className="mt-1 break-words font-body text-[9px] leading-3.5 text-[#91857b] sm:text-xs sm:leading-4">
                                                            {offer.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                                        <span className="font-body text-sm font-bold text-[#176348] sm:text-lg">
                                                            {formatPrice(
                                                                offer.offerPrice
                                                            )}
                                                        </span>

                                                        <span className="font-body text-[10px] text-[#a69a90] line-through">
                                                            {formatPrice(
                                                                regularPrice
                                                            )}
                                                        </span>
                                                    </div>

                                                    {offerSavings > 0 && (
                                                        <p className="mt-1 font-body text-[10px] font-semibold text-[#176348]">
                                                            Save{" "}
                                                            {formatPrice(
                                                                offerSavings
                                                            )}
                                                        </p>
                                                    )}

                                                    {isSelected && (
                                                        <p className="mt-1 font-body text-[10px] font-semibold text-[#176348]">
                                                            Selected
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {/* Remove Combo */}
                                {activeCombo && (
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(1)}
                                        className="mt-2 font-body text-xs font-semibold text-[#176348] underline underline-offset-4"
                                    >
                                        Remove combo selection
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Total Price Summary */}
                        <div className="order-5 mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#eee5dc] bg-white p-2.5 sm:p-3">

                            <div>
                                <p className="font-body text-[10px] text-[#91857b] sm:text-xs">
                                    Total amount ({quantity}{" "}
                                    {quantity === 1 ? "item" : "items"})
                                </p>

                                <p className="mt-1 font-body text-xl font-bold sm:text-2xl">
                                    {formatPrice(totalPrice)}
                                </p>
                            </div>

                            {savings > 0 && (
                                <div className="text-right">
                                    <p className="font-body text-[10px] text-[#91857b]">
                                        You save
                                    </p>

                                    <p className="mt-1 font-body text-xs font-bold text-[#176348] sm:text-sm">
                                        {formatPrice(savings)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart / Buy Now */}
                        <div className="order-6 mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">

                            <button
                                type="button"
                                disabled={outOfStock || pending !== null}
                                onClick={handleAddToCart}
                                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#17120f] px-4 font-body text-sm font-semibold text-[#e7c49c] transition hover:bg-[#30251e] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pending === "cart" ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <ShoppingBag size={16} />
                                )}
                                {pending === "cart" ? "Adding..." : "Add to cart"}
                            </button>

                            <button
                                type="button"
                                disabled={outOfStock || pending !== null}
                                onClick={handleBuyNow}
                                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#07162f] px-4 font-body text-sm font-semibold text-white transition hover:bg-[#105139] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {pending === "buy" ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {pending === "buy" ? "Please wait..." : "Buy now"}
                            </button>

                            {cartError && (
                                <p role="alert" className="font-body text-xs text-red-600 sm:col-span-2">
                                    {cartError}
                                </p>
                            )}
                        </div>

                        {/* Trust Features */}
                        <div className="order-7 mt-3 grid grid-cols-3 gap-2 border-t border-[#e8ded4] pt-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3 sm:pt-4">

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-[9px] leading-tight text-[#8b8077] sm:flex-row sm:text-xs">
                                <Package size={14} className="shrink-0" />
                                Plain packaging
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-[9px] leading-tight text-[#8b8077] sm:flex-row sm:text-xs">
                                <ShieldCheck size={14} className="shrink-0" />
                                Private billing
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center font-body text-[9px] leading-tight text-[#8b8077] sm:flex-row sm:text-xs">
                                <RefreshCcw size={14} className="shrink-0" />
                                Easy returns
                            </div>
                        </div>

                        {/* SKU */}
                        <p className="order-9 mt-3 font-body text-[10px] text-[#a1958b] sm:text-xs">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
