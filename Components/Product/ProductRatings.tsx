"use client";

import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";

import type { ProductRatings as ProductRatingsData, ProductReview } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface ProductRatingsProps {
    productId: string;
    productName?: string;
    ratings?: ProductRatingsData;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
    return (
        <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`${value} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                // Fill fraction for this star, so 4.3 shows a partly filled 5th star.
                const fill = Math.max(0, Math.min(1, value - (star - 1)));

                return (
                    <span key={star} className="relative inline-flex" style={{ width: size, height: size }}>
                        <Star size={size} className="absolute inset-0 text-olympus" fill="currentColor" strokeWidth={0} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <Star size={size} className="text-brand-navy" fill="currentColor" strokeWidth={0} />
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function ProductRatings({
    productId,
    productName = "this product",
    ratings,
}: ProductRatingsProps) {
    const [reviews, setReviews] = useState<ProductReview[]>(ratings?.reviews ?? []);
    const [page, setPage] = useState(ratings?.pagination.page ?? 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const summary = ratings?.summary;
    const limit = ratings?.pagination.limit ?? 5;
    const totalPages = ratings?.pagination.totalPages ?? 0;

    // Nothing to show until the product has at least one rating.
    if (!summary || summary.count === 0) return null;

    const hasMore = page < totalPages;

    async function loadMore() {
        setLoading(true);
        setError(null);

        try {
            const nextPage = page + 1;
            const response = await fetch(
                `${API_URL}/ratings/product/${productId}?page=${nextPage}&limit=${limit}`,
                { cache: "no-store" },
            );

            if (!response.ok) throw new Error("Failed to load reviews");

            const data: { items: ProductReview[] } = await response.json();

            setReviews((current) => {
                const seen = new Set(current.map((review) => review._id));
                return [...current, ...data.items.filter((review) => !seen.has(review._id))];
            });
            setPage(nextPage);
        } catch {
            setError("Couldn't load more reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section id="reviews" className="pdp-section w-full scroll-mt-24 bg-pale-gray">
            <div className="pdp-container">
                <div className="mx-auto max-w-5xl">
                    <header className="mb-8 text-center sm:mb-10">
                        <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy">
                            Customer reviews
                        </p>

                        <h2 className="font-heading text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl md:text-4xl">
                            What men say about {productName}
                        </h2>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
                        {/* Average + star distribution */}
                        <aside className="h-fit rounded-2xl border border-[#e8e1d8] bg-white p-6 text-center lg:sticky lg:top-24">
                            <p className="font-heading text-5xl font-semibold text-brand-navy">
                                {summary.average.toFixed(1)}
                            </p>

                            <div className="mt-3 flex justify-center">
                                <Stars value={summary.average} size={20} />
                            </div>

                            <p className="mt-2 font-body text-sm text-brand-navy-muted">
                                Based on {summary.count} {summary.count === 1 ? "rating" : "ratings"}
                            </p>

                            <div className="mt-6 space-y-2">
                                {([5, 4, 3, 2, 1] as const).map((star) => {
                                    const count = summary.distribution[star] ?? 0;
                                    const percent = summary.count ? (count / summary.count) * 100 : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-3 font-body text-xs text-brand-navy-muted">
                                            <span className="w-6 shrink-0 text-left">{star}★</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-pale-gray">
                                                <div
                                                    className="h-full rounded-full bg-brand-navy"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="w-8 shrink-0 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Review list (backend sends only 4★ and above) */}
                        <div>
                            {reviews.length === 0 ? (
                                <div className="rounded-2xl border border-[#e8e1d8] bg-white p-6 text-center font-body text-sm text-brand-navy-muted">
                                    No written reviews yet.
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {reviews.map((review) => (
                                        <li
                                            key={review._id}
                                            className="rounded-2xl border border-[#e8e1d8] bg-white p-5 sm:p-6"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Stars value={review.rating} />
                                                <span className="font-body text-xs text-brand-navy-muted">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>

                                            {review.title && (
                                                <h3 className="mt-3 break-words font-body text-base font-semibold leading-snug text-brand-navy sm:text-lg">
                                                    {review.title}
                                                </h3>
                                            )}

                                            {review.description && (
                                                <p className={`${review.title ? "mt-1.5" : "mt-3"} whitespace-pre-line break-words font-body text-sm leading-7 text-brand-navy-muted sm:text-base`}>
                                                    {review.description}
                                                </p>
                                            )}

                                            <div className="mt-4 flex flex-wrap items-center gap-2 font-body text-sm">
                                                <span className="font-semibold text-brand-navy">
                                                    {review.userName}
                                                </span>
                                                {review.verifiedPurchase && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-pale-gray px-2.5 py-1 text-[11px] font-semibold text-accent-green-moss">
                                                        <BadgeCheck size={13} />
                                                        Verified purchase
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {error && (
                                <p className="mt-4 text-center font-body text-sm text-[#b4412f]">{error}</p>
                            )}

                            {hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="inline-flex min-h-11 items-center rounded-full border border-brand-navy/30 bg-white px-6 py-2 font-body text-sm font-semibold text-brand-navy transition-colors hover:bg-pale-gray disabled:opacity-60"
                                    >
                                        {loading ? "Loading..." : "Load more reviews"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
