
"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import {
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
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(
        product.images?.[0] || ""
    );

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
        <section className="min-h-screen bg-[#faf7f2] text-[#211b17]">
            <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

                {/* Breadcrumb */}
                <nav className="mb-5 flex flex-wrap items-center gap-2 font-body text-xs text-[#968a80] sm:mb-7 sm:text-sm">
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

                    <span className="font-medium uppercase text-[#211b17]">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">

                    {/* LEFT: Product Images */}
                    <div className="w-full md:sticky md:top-5">

                        {/* Main Image */}
                        <div className="flex aspect-square max-h-[400px] w-[90%] items-center justify-center overflow-hidden rounded-2xl bg-[#17120f] p-5 sm:aspect-[1.08/1] sm:max-h-[350px] sm:rounded-[20px] sm:p-7">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="h-full w-[100%] object-contain"
                                />
                            ) : (
                                <Package
                                    size={70}
                                    className="text-white/30"
                                />
                            )}
                        </div>

                        {/* Image Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                                {product.images.map((image, index) => (
                                    <button
                                        type="button"
                                        key={`${image}-${index}`}
                                        onClick={() =>
                                            setSelectedImage(image)
                                        }
                                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-[#17120f] p-1.5 transition sm:h-16 sm:w-16 ${selectedImage === image
                                            ? "border-[#176348]"
                                            : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="min-w-0">

                        {/* Category */}
                        <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#176348] sm:text-xs">
                            {product.category}
                        </p>

                        {/* Product Name */}
                        <h1 className="font-heading text-[25px] font-bold uppercase leading-[1.2] tracking-wide sm:text-3xl lg:text-[34px]">
                            {product.name}
                        </h1>

                        {/* Description */}
                        <p className="mt-2 font-body text-xs leading-6 text-[#8b8077] sm:text-sm">
                            {product.description}
                        </p>

                        {/* Product Price */}
                        <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
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

                        <p className="mt-1 font-body text-[10px] text-[#9a8e84] sm:text-xs">
                            Inclusive of all taxes
                        </p>

                        {/* Quantity Selector */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
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
                            <div className="mt-6 sm:mt-7">

                                <div className="mb-3 flex items-center justify-between gap-2">
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

                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

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
                                                    className={`relative rounded-xl border p-3 text-left transition-all sm:p-3.5 ${isSelected
                                                        ? "border-[#176348] bg-[#edf5ef] ring-1 ring-[#176348]"
                                                        : "border-[#e5dcd2] bg-white hover:border-[#176348]"
                                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                                >
                                                    {isSelected && (
                                                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#176348] text-white">
                                                            <Check size={12} />
                                                        </span>
                                                    )}

                                                    <p className="pr-6 font-body text-xs font-bold sm:text-sm">
                                                        {offer.title ||
                                                            `Buy ${offer.quantity} Packs`}
                                                    </p>

                                                    {offer.description && (
                                                        <p className="mt-1 font-body text-[10px] leading-4 text-[#91857b] sm:text-xs">
                                                            {offer.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <span className="font-body text-lg font-bold text-[#176348]">
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
                        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#eee5dc] bg-white p-3.5 sm:p-4">

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
                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                            <button
                                type="button"
                                disabled={outOfStock}
                                onClick={() =>
                                    onAddToCart?.(
                                        product,
                                        quantity,
                                        totalPrice
                                    )
                                }
                                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#17120f] px-4 font-body text-sm font-semibold text-[#e7c49c] transition hover:bg-[#30251e] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShoppingBag size={16} />
                                Add to cart
                            </button>

                            <button
                                type="button"
                                disabled={outOfStock}
                                onClick={() =>
                                    onBuyNow?.(
                                        product,
                                        quantity,
                                        totalPrice
                                    )
                                }
                                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#176348] px-4 font-body text-sm font-semibold text-white transition hover:bg-[#105139] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Zap size={16} />
                                Buy now
                            </button>
                        </div>

                        {/* Trust Features */}
                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[#e8ded4] pt-4">

                            <div className="flex items-center gap-1.5 font-body text-[10px] text-[#8b8077] sm:text-xs">
                                <Package size={14} />
                                Plain packaging
                            </div>

                            <div className="flex items-center gap-1.5 font-body text-[10px] text-[#8b8077] sm:text-xs">
                                <ShieldCheck size={14} />
                                Private billing
                            </div>

                            <div className="flex items-center gap-1.5 font-body text-[10px] text-[#8b8077] sm:text-xs">
                                <RefreshCcw size={14} />
                                Easy returns
                            </div>
                        </div>

                        {/* SKU */}
                        <p className="mt-4 font-body text-[10px] text-[#a1958b] sm:text-xs">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
