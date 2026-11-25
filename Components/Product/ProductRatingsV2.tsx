import Link from "next/link";
import { Star } from "lucide-react";

import type { ProductRatings as ProductRatingsData, ProductReview } from "@/types/product";

interface ProductRatingsV2Props {
    ratings?: ProductRatingsData;
}

// Light stars for the navy background.
function Stars({ value, size = 14 }: { value: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = Math.max(0, Math.min(1, value - (star - 1)));
                return (
                    <span key={star} className="relative inline-flex" style={{ width: size, height: size }}>
                        <Star size={size} className="absolute inset-0 text-white/25" fill="currentColor" strokeWidth={0} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <Star size={size} className="text-white" fill="currentColor" strokeWidth={0} />
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
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewCard({ review }: { review: ProductReview }) {
    const meta = [review.userName, review.verifiedPurchase ? "Verified" : "", formatDate(review.createdAt)]
        .filter(Boolean)
        .join(" · ");

    return (
        <article className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:border-white/30 hover:bg-white/10 hover:shadow-xl motion-safe:hover:scale-[1.03] sm:w-[320px]">
            <Stars value={review.rating} />
            {review.title && (
                <h3 className="mt-3 break-words font-body text-sm uppercase tracking-[0.04em] text-white">
                    &ldquo;{review.title}&rdquo;
                </h3>
            )}
            {review.description && (
                <p className="mt-2 line-clamp-4 whitespace-pre-line break-words font-body text-sm leading-relaxed text-olympus">
                    {review.description}
                </p>
            )}
            <p className="mt-auto pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-palladium">
                {meta}
            </p>
        </article>
    );
}

/** Navy review band: rating summary on the left, reviews sliding as a marquee. */
export default function ProductRatingsV2({ ratings }: ProductRatingsV2Props) {
    const summary = ratings?.summary;
    if (!summary || summary.count === 0) return null;

    const reviews = ratings?.reviews ?? [];

    // Repeat short lists so one copy is wider than the screen; the marquee
    // renders that copy twice and moves by half, so the loop is seamless.
    const copies = reviews.length ? Math.max(1, Math.ceil(6 / reviews.length)) : 0;
    const track = Array.from({ length: copies }, () => reviews).flat();
    // Slower for longer tracks so the speed per card stays the same.
    const duration = `${Math.max(20, track.length * 6)}s`;

    return (
        <section id="reviews" className="w-full scroll-mt-24 bg-brand-navy py-12 text-white sm:py-14">
            <div className="pdp-container grid grid-cols-1 items-center gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">

                {/* Summary */}
                <div>
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-palladium">
                        Verified reviews
                    </p>
                    <p className="mt-3 font-heading text-5xl leading-none text-white sm:text-6xl">
                        {summary.average.toFixed(1)}
                    </p>
                    <div className="mt-3">
                        <Stars value={summary.average} size={16} />
                    </div>
                    <p className="mt-3 max-w-[260px] font-body text-xs leading-relaxed text-olympus">
                        From {summary.count} {summary.count === 1 ? "buyer" : "buyers"} with a delivered order. We never publish unverified reviews.
                    </p>
                    <Link
                        href="/user/orders"
                        className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-white/40 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-brand-navy"
                    >
                        Write a review
                    </Link>
                </div>

                {/* Sliding reviews */}
                {track.length ? (
                    <div className="bestseller-marquee-wrap min-w-0">
                        <div
                            className="bestseller-marquee flex w-max gap-4"
                            style={{ "--marquee-duration": duration } as React.CSSProperties}
                        >
                            {track.map((review, index) => (
                                <ReviewCard key={`a-${review._id}-${index}`} review={review} />
                            ))}
                            <div data-duplicate aria-hidden="true" className="flex gap-4">
                                {track.map((review, index) => (
                                    <ReviewCard key={`b-${review._id}-${index}`} review={review} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="font-body text-sm text-olympus">No written reviews yet.</p>
                )}

            </div>
        </section>
    );
}
