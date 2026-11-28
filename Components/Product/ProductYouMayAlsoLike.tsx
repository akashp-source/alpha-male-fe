"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart";
import { canOptimizeImage } from "@/lib/image-hosts";

type RecommendedProduct = Pick<Product, "_id" | "name" | "price" | "images" | "stock" | "isActive"> & {
    compareAtPrice?: number | null;
    category?: string;
    slug?: string;
    description?: string;
};

const formatPrice = (price: number) => `₹${Number(price || 0).toLocaleString("en-IN")}`;
const productHref = (item: { _id: string; slug?: string }) => `/products/${item.slug || item._id}`;

/** recommendations.x is { products: [...] } (or a bare array). */
function listOf<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[];
    const products = (value as { products?: unknown } | null | undefined)?.products;
    return Array.isArray(products) ? (products as T[]) : [];
}

// Product page theme (admin → Page theme). '' = white page, brand navy.
const SECTION = {
    "": "bg-white text-brand-navy",
    light: "bg-white text-brand-navy",
    pale: "bg-pale-gray text-brand-navy",
    navy: "bg-brand-navy text-white",
    blush: "bg-blush text-brand-navy",
    cream: "bg-cream text-brand-navy",
    teal: "bg-teal-soft bg-[radial-gradient(ellipse_at_50%_100%,var(--color-teal-soft-light),var(--color-teal-soft)_70%)] text-brand-navy",
    sand: "bg-sand bg-[radial-gradient(ellipse_at_50%_100%,var(--color-sand-light),var(--color-sand)_70%)] text-brand-navy",
    mint: "bg-mint bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mint-light),var(--color-mint)_70%)] text-brand-navy",
    petal: "bg-petal bg-[radial-gradient(ellipse_at_50%_100%,var(--color-petal-light),var(--color-petal)_70%)] text-brand-navy",
    mist: "bg-mist bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mist-light),var(--color-mist)_70%)] text-brand-navy",
} as const;

// Accent: [on light backgrounds, on dark backgrounds]; card image tint.
const ACCENT_TEXT = {
    rose: ["text-accent-rose", "text-accent-rose-light"],
    orange: ["text-accent-orange", "text-accent-orange-light"],
    gold: ["text-accent-gold-deep", "text-accent-gold-light"],
    emerald: ["text-accent-emerald", "text-accent-emerald-light"],
    wine: ["text-accent-wine", "text-accent-wine-light"],
} as const;
const ACCENT_TINT = { rose: "bg-blush/70", orange: "bg-cream", gold: "bg-sand-light", emerald: "bg-mint-light", wine: "bg-petal-light" } as const;

/**
 * "You may also like" at the bottom of the product page, in the product's
 * page theme. Products from the categories chosen in admin (default: same category), minus the
 * frequently-bought-together add-ons shown by the buy buttons.
 */
export default function ProductYouMayAlsoLike({ product }: { product: Product }) {
    const [addingProductId, setAddingProductId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const items = useMemo(() => {
        const fbtIds = listOf<{ product?: RecommendedProduct }>(product.recommendations?.frequentlyBoughtTogether)
            .map((entry) => entry?.product?._id)
            .filter(Boolean);
        const excluded = new Set([product._id, ...fbtIds]);
        const unique = new Map<string, RecommendedProduct>();
        for (const item of listOf<RecommendedProduct>(product.recommendations?.youMayAlsoLike)) {
            if (!item?._id || excluded.has(item._id) || item.isActive === false || item.stock <= 0) continue;
            unique.set(item._id, item);
        }
        return Array.from(unique.values());
    }, [product._id, product.recommendations]);

    if (!items.length) return null;

    const theme = (product.pageTheme ?? "") as keyof typeof SECTION;
    const dark = theme === "navy";
    const accent = product.pageAccent as keyof typeof ACCENT_TEXT;
    const accentText = ACCENT_TEXT[accent] ? ACCENT_TEXT[accent][dark ? 1 : 0] : dark ? "text-olympus" : "text-brand-navy";
    const imageTint = ACCENT_TINT[accent as keyof typeof ACCENT_TINT] ?? "bg-pale-gray";

    const add = async (item: RecommendedProduct) => {
        if (addingProductId) return;
        setAddingProductId(item._id);
        setMessage("");
        try {
            await addToCart(item._id, 1);
            setMessage(`${item.name} added to your cart`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to add item");
        } finally {
            setAddingProductId(null);
        }
    };

    return (
        <section aria-labelledby="you-may-also-like" className={`w-full py-14 sm:py-20 ${SECTION[theme] ?? SECTION[""]}`}>
            <div className="pdp-container">
                <p className={`font-body text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-xs ${accentText}`}>
                    {product.recommendationsEyebrow?.trim() || "Handpicked for you"}
                </p>
                <h2 id="you-may-also-like" className="mt-3 font-heading text-3xl leading-tight sm:text-5xl">
                    {product.recommendationsTitle?.trim() || "You may also like"}
                </h2>

                {/* Phones: swipe row. Tablet: 2 per row. Desktop: 3 per row. */}
                <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                    {items.map((item) => {
                        const discount = item.compareAtPrice && item.compareAtPrice > item.price
                            ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                            : 0;
                        const image = item.images?.[0];
                        return (
                            <article
                                key={item._id}
                                className="group flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[28px] bg-white p-4 text-brand-navy shadow-[0_18px_40px_rgba(33,46,73,0.10)] sm:w-auto sm:max-w-none sm:p-5"
                            >
                                <Link
                                    href={productHref(item)}
                                    className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl ${imageTint}`}
                                >
                                    {discount > 0 && (
                                        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-navy px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                                            {discount}% off
                                        </span>
                                    )}
                                    {image && (
                                        <span className="absolute inset-6">
                                            <Image
                                                unoptimized={!canOptimizeImage(image)}
                                                src={image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 33vw"
                                                className="rounded-lg object-contain transition-transform duration-500 motion-safe:group-hover:scale-105"
                                            />
                                        </span>
                                    )}
                                </Link>

                                <div className="flex flex-1 flex-col px-1 pt-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <Link href={productHref(item)} className="line-clamp-2 font-heading text-lg leading-snug hover:underline sm:text-xl">
                                            {item.name}
                                        </Link>
                                        <span className="shrink-0 text-right">
                                            <span className="block font-heading text-lg sm:text-xl">{formatPrice(item.price)}</span>
                                            {discount > 0 && (
                                                <span className="block font-body text-xs text-brand-navy-muted line-through">{formatPrice(item.compareAtPrice!)}</span>
                                            )}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="mt-2 line-clamp-1 font-body text-sm text-brand-navy-muted">{item.description}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => add(item)}
                                        disabled={addingProductId === item._id}
                                        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 font-body text-xs font-bold uppercase tracking-[0.2em] text-brand-navy transition hover:gap-3 disabled:opacity-60"
                                    >
                                        {addingProductId === item._id ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Adding...
                                            </>
                                        ) : (
                                            <>
                                                Add to cart <span aria-hidden="true">→</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {message && (
                    <p role="status" className="mt-4 text-center font-body text-sm font-medium">
                        {message}
                    </p>
                )}
            </div>
        </section>
    );
}
