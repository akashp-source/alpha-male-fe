"use client";

import { Check, Package } from "lucide-react";

import type { Product } from "@/types/product";

/** A frequently-bought-together product offered as a tick box by the buy buttons. */
export type FbtAddOnItem = {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    image?: string;
    stock: number;
};

/** How many products to offer next to the buy buttons. */
const MAX_ITEMS = 3;

const formatPrice = (price: number) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

/**
 * Products bought together with this one, from the product API
 * (`recommendations.frequentlyBoughtTogether`, entries with `.product`).
 * Drops this product, the admin add-on, inactive and sold-out items.
 */
export function frequentlyBoughtAddOns(product: Product, excludeIds: string[] = []): FbtAddOnItem[] {
    const raw = product.recommendations?.frequentlyBoughtTogether as unknown;
    const entries: unknown[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { products?: unknown } | null | undefined)?.products)
            ? ((raw as { products: unknown[] }).products)
            : [];

    const skip = new Set([product._id, ...excludeIds]);
    const items = new Map<string, FbtAddOnItem>();
    for (const entry of entries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item = ((entry as any)?.product ?? entry) as any;
        if (!item?._id || skip.has(item._id) || item.isActive === false) continue;
        if (!(Number(item.stock) > 0) || !Number.isFinite(Number(item.price))) continue;
        items.set(item._id, {
            _id: item._id,
            name: String(item.name ?? ""),
            price: Number(item.price),
            compareAtPrice: item.compareAtPrice ?? null,
            image: Array.isArray(item.images) ? item.images[0] : undefined,
            stock: Number(item.stock),
        });
        if (items.size >= MAX_ITEMS) break;
    }
    return Array.from(items.values());
}

/** The MRP of one item (its strike-through price, or its price). */
export function fbtItemMrp(item: FbtAddOnItem) {
    return item.compareAtPrice && item.compareAtPrice > item.price ? item.compareAtPrice : item.price;
}

/** "Frequently bought together" tick boxes, styled like the add-on box above them. */
export default function FrequentlyBoughtAddOns({
    items,
    selectedIds,
    onToggle,
    disabled,
}: {
    items: FbtAddOnItem[];
    selectedIds: string[];
    onToggle: (id: string, checked: boolean) => void;
    disabled?: boolean;
}) {
    if (!items.length) return null;

    return (
        <fieldset className="mt-3">
            {/* Heading hidden on screen (kept for screen readers). */}
            <legend className="sr-only">
                Frequently bought together
            </legend>
            <div className="space-y-2">
                {items.map((item) => {
                    const checked = selectedIds.includes(item._id);
                    const hasMrp = Boolean(item.compareAtPrice && item.compareAtPrice > item.price);
                    return (
                        <label
                            key={item._id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition sm:gap-4 ${checked
                                ? "border-brand-navy bg-white"
                                : "border-olympus bg-white hover:border-brand-navy/50"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => onToggle(item._id, event.target.checked)}
                                disabled={disabled}
                                className="h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                            />

                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pale-gray">
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                                ) : (
                                    <Package size={20} aria-hidden="true" className="text-brand-navy-muted" />
                                )}
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-body text-sm font-semibold leading-snug text-brand-navy">
                                    {item.name}
                                </span>
                                <span className="mt-0.5 block font-body text-sm text-brand-navy">
                                    {formatPrice(item.price)}
                                    {hasMrp && item.compareAtPrice && (
                                        <>
                                            {" "}
                                            <s className="text-brand-navy-muted">
                                                <span className="sr-only">was </span>
                                                {formatPrice(item.compareAtPrice)}
                                            </s>
                                        </>
                                    )}
                                </span>
                            </span>

                            {checked && <Check size={16} aria-hidden="true" className="shrink-0 text-success-green" />}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
