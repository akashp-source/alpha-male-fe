"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import RichDescription from "./RichDescription";

interface ProductDetailedDescriptionV2Props {
    detailedDescription?: string;
    productName?: string;
}

// Long text is collapsed behind "Read more" so it doesn't dominate the page on mobile.
const COLLAPSE_THRESHOLD = 700;

/** Long description: heading on the left, text on the right, under a thin divider. */
export default function ProductDetailedDescriptionV2({
    detailedDescription,
    productName = "this product",
}: ProductDetailedDescriptionV2Props) {
    const [expanded, setExpanded] = useState(false);

    const text = detailedDescription?.trim();
    if (!text) return null;

    const isLong = text.length > COLLAPSE_THRESHOLD;
    const collapsed = isLong && !expanded;

    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className="pdp-container">
                <div className="border-t border-olympus pt-8 sm:pt-10">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">

                        {/* Heading */}
                        <header className="lg:sticky lg:top-24 lg:self-start">
                            <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                                Know more
                            </p>
                            <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                                About {productName}
                            </h2>
                        </header>

                        {/* Text */}
                        <div>
                            <div
                                id="product-detailed-description"
                                className={`relative overflow-hidden ${collapsed ? "max-h-72 sm:max-h-80" : "max-h-none"}`}
                            >
                                {/* Bullets, numbered lines, "#" headings and **bold** render as real markup */}
                                <RichDescription
                                    text={text}
                                    className="space-y-4 font-body text-sm leading-7 text-brand-navy-muted sm:text-base sm:leading-8"
                                />

                                {collapsed && (
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
                                )}
                            </div>

                            {isLong && (
                                <button
                                    type="button"
                                    onClick={() => setExpanded((value) => !value)}
                                    aria-expanded={expanded}
                                    aria-controls="product-detailed-description"
                                    className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-brand-navy font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-navy transition-opacity hover:opacity-70"
                                >
                                    {expanded ? "Read less" : "Read more"}
                                    <ChevronDown
                                        size={14}
                                        aria-hidden="true"
                                        className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                                    />
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
