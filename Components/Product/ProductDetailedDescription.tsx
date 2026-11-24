"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import RichDescription from "./RichDescription";

interface ProductDetailedDescriptionProps {
    detailedDescription?: string;
    productName?: string;
}

// Long text is collapsed behind "Read more" so it doesn't dominate the page on mobile.
const COLLAPSE_THRESHOLD = 700;

export default function ProductDetailedDescription({
    detailedDescription,
    productName = "this product",
}: ProductDetailedDescriptionProps) {
    const [expanded, setExpanded] = useState(false);

    const text = detailedDescription?.trim();
    if (!text) return null;

    const isLong = text.length > COLLAPSE_THRESHOLD;
    const collapsed = isLong && !expanded;

    return (
        <section className="pdp-section w-full bg-white">
            <div className="pdp-container">
                <div className="mx-auto max-w-4xl">
                    <header className="mb-8 text-center sm:mb-10">
                        <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy">
                            Know more
                        </p>

                        <h2 className="font-heading text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl md:text-4xl">
                            About {productName}
                        </h2>
                    </header>

                    <div className="rounded-2xl border border-[#e8e1d8] bg-pale-gray px-5 py-6 sm:px-8 sm:py-8 md:px-10">
                        <div
                            id="product-detailed-description"
                            className={`relative overflow-hidden transition-[max-height] duration-500 ${collapsed ? "max-h-72 sm:max-h-80" : "max-h-none"
                                }`}
                        >
                            {/* Bullets, numbered lines, "#" headings and **bold** render as real markup */}
                            <RichDescription
                                text={text}
                                className="space-y-4 font-body text-sm leading-7 text-brand-navy-muted sm:text-base sm:leading-8"
                            />

                            {collapsed && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-pale-gray to-transparent" />
                            )}
                        </div>

                        {isLong && (
                            <div className="mt-5 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setExpanded((value) => !value)}
                                    aria-expanded={expanded}
                                    aria-controls="product-detailed-description"
                                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-navy/30 bg-white px-5 py-2 font-body text-sm font-semibold text-brand-navy transition-colors hover:bg-pale-gray"
                                >
                                    {expanded ? "Read less" : "Read more"}
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
