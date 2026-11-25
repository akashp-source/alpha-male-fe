"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart";

type RecommendedProduct = Pick<
    Product,
    "_id" | "name" | "price" | "images" | "stock" | "isActive"
> & { compareAtPrice?: number | null; category?: string };

type RecommendationResponse = {
    product: RecommendedProduct;
    score?: number;
    purchaseCount?: number;
    confidence?: number;
    lift?: number;
};

const formatPrice = (price: number) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

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

export default function ProductRecommendations({ product }: { product: Product }) {
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
    const [deselectedIds, setDeselectedIds] = useState<string[]>([]);
    const [addingBundle, setAddingBundle] = useState(false);
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

    const bundleProducts = useMemo(
        () => [
            {
                _id: product._id,
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

    if (!frequentlyBoughtProducts.length && !youMayAlsoLike.length) return null;

    return (
        <section className="pdp-section w-full  text-brand-navy">
            <div className="pdp-container space-y-10 sm:space-y-12">
                {frequentlyBoughtProducts.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-brand-navy bg-transparent p-5 text-brand-navy shadow-[0_12px_32px_rgba(33,27,23,0.12)] sm:p-7 lg:p-9">
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.25em] text-success-green">Complete the routine</p>
                        <h2 className="mt-2 font-heading text-xl font-semibold uppercase sm:text-2xl">Frequently bought together</h2>
                        <p className="mt-1 font-body text-xs text-brand-navy-muted">Picked to go well with {product.name}</p>

                        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_230px] lg:items-center">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {bundleProducts.map((item, index) => (
                                    <label key={item._id} className="relative flex min-w-0 cursor-pointer gap-3 rounded-xl bg-pale-gray p-3 text-brand-navy">
                                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#eee8de]">
                                            {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill sizes="64px" className="object-contain p-1" />}
                                            {index === 0 && <span className="absolute left-1 top-1 rounded bg-brand-navy px-1 py-0.5 text-[7px] font-bold uppercase text-white">This item</span>}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                                            <span className="line-clamp-2 font-body text-xs font-semibold">{item.name}</span>
                                            <span className="font-body text-xs font-bold">{formatPrice(item.price)}</span>
                                            <span className="flex items-center gap-1 font-body text-[10px] text-brand-navy-muted">
                                                <input type="checkbox" checked={isSelected(item._id)} disabled={item._id === product._id} onChange={() => toggleBundleProduct(item._id)} className="accent-success-green" />
                                                {item._id === product._id ? "Current product" : "Add to bundle"}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="rounded-xl border border-[#e8ded4] bg-white/70 p-4 shadow-sm">
                                <p className="font-body text-[10px] text-brand-navy-muted">Total for {selectedProducts.length} {selectedProducts.length === 1 ? "item" : "items"}</p>
                                <p className="mt-1 font-body text-2xl font-bold">{formatPrice(bundleTotal)}</p>
                                <button type="button" onClick={addBundle} disabled={addingBundle || !selectedProducts.length} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-3 font-body text-xs font-bold text-white transition hover:bg-[#14284d] disabled:opacity-60">
                                    {addingBundle ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
                                    {addingBundle ? "Adding..." : `Add ${selectedProducts.length} to cart`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {youMayAlsoLike.length > 0 && (
                    <div>
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.25em] text-success-green">Handpicked for you</p>
                        <h2 className="mt-1 font-heading text-xl font-semibold uppercase sm:text-2xl">You may also like</h2>
                        <div className="mt-5 flex gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                            {youMayAlsoLike.map((item) => {
                                const discount = item.compareAtPrice && item.compareAtPrice > item.price
                                    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                                    : 0;
                                return (
                                    <article key={item._id} className="w-[190px] shrink-0 overflow-hidden rounded-xl border border-[#e8ded4] bg-white sm:w-auto">
                                        <div className="relative flex aspect-square items-center justify-center bg-[#eee8de]">
                                            {discount > 0 && <span className="absolute left-2 top-2 z-10 rounded bg-success-green px-2 py-1 font-body text-[9px] font-bold text-white">{discount}% OFF</span>}
                                            {item.category && <span className="absolute right-2 top-2 z-10 rounded bg-white px-2 py-1 font-body text-[8px] font-bold uppercase text-brand-navy">{item.category}</span>}
                                            {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill sizes="(max-width: 640px) 190px, 25vw" className="object-contain p-4" />}
                                        </div>
                                        <div className="p-3">
                                            <p className="line-clamp-2 min-h-9 font-body text-xs font-semibold leading-4">{item.name}</p>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="font-body text-sm font-bold">{formatPrice(item.price)}</span>
                                                {item.compareAtPrice && item.compareAtPrice > item.price && <span className="font-body text-[10px] text-brand-navy-muted line-through">{formatPrice(item.compareAtPrice)}</span>}
                                            </div>
                                            <button type="button" onClick={() => addRecommended(item)} disabled={addingProductId === item._id} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-navy font-body text-[10px] font-bold text-white transition hover:bg-[#14284d] disabled:opacity-60">
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
                {message && <p role="status" className="text-center font-body text-xs font-medium text-success-green">{message}</p>}
            </div>
        </section>
    );
}
