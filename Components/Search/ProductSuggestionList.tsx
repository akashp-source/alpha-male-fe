"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { canOptimizeImage } from "@/lib/image-hosts";
import { productHref } from "@/lib/productUrl";
import type { ProductSuggestion } from "./useProductSuggestions";

const money = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

interface ProductSuggestionListProps {
    listId: string;
    term: string;
    suggestions: ProductSuggestion[];
    ready: boolean;
    loading: boolean;
    active: number;
    onActiveChange: (index: number) => void;
    /** A product was clicked (the link then opens it). */
    onPick: () => void;
    /** "See all results" was clicked. */
    onSeeAll: () => void;
}

/** Matching products under a search box + "See all results". */
export default function ProductSuggestionList({
    listId,
    term,
    suggestions,
    ready,
    loading,
    active,
    onActiveChange,
    onPick,
    onSeeAll,
}: ProductSuggestionListProps) {
    if (!term) return null;

    return (
        <div>
            {suggestions.length > 0 ? (
                <ul id={listId} role="listbox" aria-label="Matching products" className="divide-y divide-pale-gray">
                    {suggestions.map((product, index) => (
                        <li key={product._id} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
                            <Link
                                href={productHref(product)}
                                onClick={onPick}
                                onMouseEnter={() => onActiveChange(index)}
                                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 transition ${index === active ? "bg-pale-gray" : "hover:bg-pale-gray"}`}
                            >
                                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-pale-gray">
                                    {product.images?.[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt=""
                                            fill
                                            sizes="44px"
                                            unoptimized={!canOptimizeImage(product.images[0])}
                                            className="object-contain p-1"
                                        />
                                    )}
                                </span>
                                <span className="min-w-0 flex-1 truncate font-body text-sm font-semibold text-brand-navy">{product.name}</span>
                                <span className="shrink-0 font-body text-sm text-brand-navy-muted">{money(product.price)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && ready && (
                    <p className="px-2 py-3 font-body text-sm text-brand-navy-muted">No products match &ldquo;{term}&rdquo;.</p>
                )
            )}

            <button
                type="button"
                onClick={onSeeAll}
                className="mt-1 inline-flex items-center gap-1.5 px-2 py-2 font-body text-sm font-semibold text-brand-navy hover:underline"
            >
                See all results for &ldquo;{term}&rdquo;
                <ArrowRight size={15} aria-hidden="true" />
            </button>
        </div>
    );
}
