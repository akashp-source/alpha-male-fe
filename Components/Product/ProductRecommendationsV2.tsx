"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { /* Check, */ Loader2, /* Plus, */ ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart";

type RecommendedProduct = Pick<
    Product,
    "_id" | "name" | "price" | "images" | "stock" | "isActive"
> & { compareAtPrice?: number | null; category?: string; slug?: string };

type RecommendationResponse = {
    product: RecommendedProduct;
    score?: number;
    purchaseCount?: number;
    confidence?: number;
    lift?: number;
};

const formatPrice = (price: number) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

const productHref = (item: { _id: string; slug?: string }) => `/products/${item.slug || item._id}`;

/**
 * The product info API returns
 *   recommendations.frequentlyBoughtTogether.products  (entries with .product)
 *   recommendations.youMayAlsoLike.products            (products)
 * Accept a bare array too, in case the shape is flattened later.
 */
function listOf<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[];
    const products = (value as { products?: unknown } | null | undefined)?.products;
    return Array.isArray(products) ? (products as T[]) : [];
}

const eyebrow = "mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy";
const heading = "font-heading text-3xl leading-tight text-brand-navy sm:text-4xl";

/** "Frequently bought together" + "You may also like", in the product page's newer style. */
export default function ProductRecommendationsV2({ product }: { product: Product }) {
    // Recommendations come with the product (GET /product/info/:id), so no
    // extra request is needed.
    const frequentlyBoughtEntries = useMemo(
        () => listOf<RecommendationResponse>(product.recommendations?.frequentlyBoughtTogether),
        [product.recommendations],
    );
    const youMayAlsoLikeEntries = useMemo(
        () => listOf<RecommendedProduct>(product.recommendations?.youMayAlsoLike),
        [product.recommendations],
    );

    // Every bundle item starts selected; track the ones the user unticks.
    // Old "Frequently bought together" section (commented out below).
    // const [deselectedIds, setDeselectedIds] = useState<string[]>([]);
    // const [addingBundle, setAddingBundle] = useState(false);
    const [addingProductId, setAddingProductId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const frequentlyBoughtProducts = useMemo(() => {
        const unique = new Map<string, RecommendedProduct>();
        for (const entry of frequentlyBoughtEntries) {
            const item = entry?.product;
            if (!item?._id || item._id === product._id || item.isActive === false || item.stock <= 0) continue;
            unique.set(item._id, item);
        }
        return Array.from(unique.values());
    }, [product._id, frequentlyBoughtEntries]);

    const youMayAlsoLike = useMemo(() => {
        const excluded = new Set([
            product._id,
            ...frequentlyBoughtProducts.map((item) => item._id),
        ]);
        const unique = new Map<string, RecommendedProduct>();
        for (const item of youMayAlsoLikeEntries) {
            if (!item?._id || excluded.has(item._id) || item.isActive === false || item.stock <= 0) continue;
            unique.set(item._id, item);
        }
        return Array.from(unique.values());
    }, [frequentlyBoughtProducts, product._id, youMayAlsoLikeEntries]);

    /* Old "Frequently bought together" section (replaced by FrequentlyBoughtAddOns)
    const bundleProducts = useMemo(
        () => [
            {
                _id: product._id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                images: product.images,
                stock: product.stock,
                isActive: true,
            },
            ...frequentlyBoughtProducts,
        ],
        [frequentlyBoughtProducts, product],
    );

    const isSelected = (id: string) => id === product._id || !deselectedIds.includes(id);
    const selectedProducts = bundleProducts.filter((item) => isSelected(item._id));
    const bundleTotal = selectedProducts.reduce((total, item) => total + item.price, 0);

    const toggleBundleProduct = (id: string) => {
        if (id === product._id) return;
        setDeselectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const addBundle = async () => {
        if (addingBundle || selectedProducts.length === 0) return;
        setAddingBundle(true);
        setMessage("");
        try {
            for (const item of selectedProducts) await addToCart(item._id, 1);
            setMessage("Added to your cart");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to add items");
        } finally {
            setAddingBundle(false);
        }
    };
    */

    const addRecommended = async (item: RecommendedProduct) => {
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

    // if (!frequentlyBoughtProducts.length && !youMayAlsoLike.length) return null;
    if (!youMayAlsoLike.length) return null;

    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className="pdp-container space-y-14 sm:space-y-16">

                {/* Frequently bought together: old section, replaced by the tick boxes
                    by the buy buttons (FrequentlyBoughtAddOns in ProductBuySection).
                                {frequentlyBoughtProducts.length > 0 && (
                    <div>
                        <p className={eyebrow}>Complete the routine</p>
                        <h2 className={heading}>Frequently bought together</h2>
                        <p className="mt-2 font-body text-sm text-brand-navy-muted">Picked to go well with {product.name}.</p>

                        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
                            {/ * Items, joined by "+" * /}
                            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                                {bundleProducts.map((item, index) => {
                                    const current = item._id === product._id;
                                    const selected = isSelected(item._id);
                                    return (
                                        <li key={item._id} className="flex items-center gap-2 sm:gap-3">
                                            {index > 0 && (
                                                <span aria-hidden="true" className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-olympus text-brand-navy sm:flex">
                                                    <Plus size={14} />
                                                </span>
                                            )}
                                            <label
                                                className={`relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border bg-pale-gray p-2.5 transition sm:w-[230px] sm:flex-none duration-300 ${selected ? "border-brand-navy" : "border-transparent opacity-70 hover:opacity-100"} ${current ? "cursor-default" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    disabled={current}
                                                    onChange={() => toggleBundleProduct(item._id)}
                                                    className="peer sr-only"
                                                />
                                                {/ * Custom tick, top-right * /}
                                                <span
                                                    aria-hidden="true"
                                                    className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-navy ${selected ? "border-brand-navy bg-brand-navy text-white" : "border-medium-gray bg-white"}`}
                                                >
                                                    {selected && <Check size={12} strokeWidth={3} />}
                                                </span>

                                                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                                                    {item.images?.[0] && <Image src={item.images[0]} alt="" fill sizes="56px" className="object-contain p-1" />}
                                                </span>
                                                <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-5">
                                                    {current && (
                                                        <span className="font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">This item</span>
                                                    )}
                                                    <span className="line-clamp-2 font-body text-xs font-semibold leading-snug">{item.name}</span>
                                                    <span className="font-body text-xs text-brand-navy">{formatPrice(item.price)}</span>
                                                </span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/ * Total * /}
                            <div className="flex flex-col justify-center self-start rounded-xl bg-brand-navy p-5 text-white shadow-[0_10px_24px_rgba(33,46,73,0.22)]">
                                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-palladium">
                                    Total for {selectedProducts.length} {selectedProducts.length === 1 ? "item" : "items"}
                                </p>
                                <p className="mt-1 font-heading text-2xl text-white">{formatPrice(bundleTotal)}</p>
                                <button
                                    type="button"
                                    onClick={addBundle}
                                    disabled={addingBundle || !selectedProducts.length}
                                    className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-white px-3 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-navy transition hover:bg-olympus disabled:opacity-60"
                                >
                                    {addingBundle ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                                    {addingBundle ? "Adding..." : `Add ${selectedProducts.length} to cart`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                */}

                {/* You may also like */}
                {youMayAlsoLike.length > 0 && (
                    <div>
                        <p className={eyebrow}>Handpicked for you</p>
                        <h2 className={heading}>You may also like</h2>

                        <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                            {youMayAlsoLike.map((item) => {
                                const discount = item.compareAtPrice && item.compareAtPrice > item.price
                                    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                                    : 0;
                                return (
                                    <article
                                        key={item._id}
                                        className="group flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-olympus bg-white transition duration-300 hover:border-brand-navy/40 hover:shadow-[0_14px_32px_rgba(33,46,73,0.15)] motion-safe:hover:-translate-y-1 sm:w-auto"
                                    >
                                        <Link href={productHref(item)} className="relative flex aspect-square items-center justify-center bg-pale-gray">
                                            {discount > 0 && (
                                                <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-navy px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                                                    {discount}% off
                                                </span>
                                            )}
                                            {item.images?.[0] && (
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 640px) 220px, 25vw"
                                                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                                                />
                                            )}
                                        </Link>
                                        <div className="flex flex-1 flex-col p-4">
                                            {item.category && (
                                                <p className="font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">
                                                    {item.category.replace(/-/g, " ")}
                                                </p>
                                            )}
                                            <Link href={productHref(item)} className="mt-1 line-clamp-2 min-h-10 font-body text-sm font-semibold leading-snug hover:underline">
                                                {item.name}
                                            </Link>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="font-body text-sm font-semibold">{formatPrice(item.price)}</span>
                                                {item.compareAtPrice && item.compareAtPrice > item.price && (
                                                    <span className="font-body text-xs text-brand-navy-muted line-through">{formatPrice(item.compareAtPrice)}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addRecommended(item)}
                                                disabled={addingProductId === item._id}
                                                className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand-navy font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-navy transition hover:bg-brand-navy hover:text-white disabled:opacity-60"
                                            >
                                                {addingProductId === item._id ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                                                {addingProductId === item._id ? "Adding..." : "Add to cart"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}

                {message && <p role="status" className="text-center font-body text-sm font-medium text-brand-navy">{message}</p>}
            </div>
        </section>
    );
}
