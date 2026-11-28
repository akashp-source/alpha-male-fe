"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play, ShoppingBag } from "lucide-react";
import type { FeaturedProduct } from "@/lib/featured-products";
import { productHref } from "@/lib/productUrl";
import { canOptimizeImage } from "@/lib/image-hosts";
import { withBold } from "@/lib/inline-bold";
import { accentText, THEME_BACKGROUND, themeOf, useAutoplay, useMediaQuery } from "@/lib/featured-theme";

/** Time between automatic slides. */
const AUTOPLAY_MS = 3000;
/** Most cards on screen at once (desktop); also the number of loop clones. */
const MAX_PER_VIEW = 4;

export default function FeaturedConceptA({ products }: { products: FeaturedProduct[] | null }) {
    const count = products?.length ?? 0;
    // Cards on screen: phones ~1 (with a peek of the next), tablets 2, desktop 4.
    // Layout is pure CSS (--slot); this only decides whether sliding is needed.
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const isTablet = useMediaQuery("(min-width: 640px)");
    const perView = isDesktop ? MAX_PER_VIEW : isTablet ? 2 : 1;
    const sliding = count > perView;

    // Position on the track. The first cards are repeated after the last one,
    // so the track keeps moving forward and then jumps back unseen (a loop).
    const [start, setStart] = useState(0);
    const [animate, setAnimate] = useState(true);
    const touchX = useRef<number | null>(null);

    const next = () => {
        setAnimate(true);
        // Already past the end (no transition ran, e.g. reduced motion): wrap first.
        setStart((value) => (value >= count ? value - count : value) + 1);
    };
    const prev = () => {
        if (start > 0 && start <= count) {
            setAnimate(true);
            setStart(start - 1);
            return;
        }
        // At the start: jump (unseen) to the copy at the end, then slide back one.
        setAnimate(false);
        setStart(count);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            setAnimate(true);
            setStart(count - 1);
        }));
    };
    const onTransitionEnd = () => {
        if (start >= count) {
            setAnimate(false);
            setStart(start - count);
        }
    };

    const { stopped, toggle, pauseProps } = useAutoplay({
        enabled: sliding,
        delay: AUTOPLAY_MS,
        step: next,
        resetKey: start,
    });

    if (!products?.length) return null;

    const position = sliding ? start % count : 0;
    const shownCount = Math.min(perView, count);
    const items = sliding ? [...products, ...products.slice(0, Math.min(MAX_PER_VIEW, count))] : products;
    const trackStyle = { transform: `translateX(calc(var(--slot) * -${sliding ? start : 0}))` } as CSSProperties;

    return <section aria-label="Featured products, card track concept" aria-roledescription="carousel" {...pauseProps} className="bg-white px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
                <div><p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-navy-muted">Handpicked for you · Concept A</p><h2 className="text-3xl text-brand-navy sm:text-4xl">Our Featured Products</h2></div>
                {sliding && <div className="flex gap-2">
                    <button type="button" onClick={toggle} aria-label={stopped ? "Play featured products slideshow" : "Pause featured products slideshow"} className="rounded-full border border-olympus p-2.5 text-brand-navy transition hover:bg-brand-navy hover:text-white">{stopped ? <Play size={18} /> : <Pause size={18} />}</button>
                    <button type="button" onClick={prev} aria-label="Previous products" className="rounded-full border border-olympus p-2.5 text-brand-navy transition hover:bg-brand-navy hover:text-white"><ArrowLeft size={18} /></button>
                    <button type="button" onClick={next} aria-label="Next products" className="rounded-full border border-olympus p-2.5 text-brand-navy transition hover:bg-brand-navy hover:text-white"><ArrowRight size={18} /></button>
                </div>}
            </div>

            {/* Slot width: phones 85% (next card peeks in), tablets 50%, desktop 25%. Vertical padding leaves room for the hover lift. */}
            <div
                className="-mx-2 overflow-hidden py-4 [--slot:85%] sm:[--slot:50%] lg:[--slot:25%]"
                onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
                onTouchEnd={(event) => {
                    if (!sliding || touchX.current === null) return;
                    const delta = event.changedTouches[0].clientX - touchX.current;
                    touchX.current = null;
                    if (Math.abs(delta) > 40) (delta < 0 ? next : prev)();
                }}
            >
                <div
                    className={`flex ${animate ? "transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.2,1)] motion-reduce:transition-none" : ""}`}
                    style={trackStyle}
                    onTransitionEnd={onTransitionEnd}
                >
                    {items.map((product, index) => {
                        const clone = index >= count;
                        const own = index % count;
                        const theme = themeOf(product);
                        const dark = theme === "navy";
                        // No page theme: the original alternating light greys.
                        const background = THEME_BACKGROUND[theme] ?? (own % 2 ? "bg-olympus" : "bg-pale-gray");
                        return <div key={`${product._id}-${index}`} aria-hidden={clone || undefined} className="w-[var(--slot)] min-w-0 shrink-0 grow-0 basis-[var(--slot)] px-2">
                            <article className={`h-full overflow-hidden rounded-xl border shadow-sm transition duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-xl focus-within:-translate-y-1 focus-within:scale-[1.04] focus-within:shadow-xl motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${dark ? "border-white/10 text-white" : "border-olympus text-brand-navy"} ${background}`}>
                                <Link href={productHref(product)} tabIndex={clone ? -1 : undefined} aria-label={`View ${product.name}`} className="flex h-full flex-col">
                                    <div className="relative mx-3 mt-3 aspect-square overflow-hidden rounded-lg bg-white">
                                        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-navy px-2.5 py-1 font-body text-[10px] font-semibold text-white">{product.taglines?.[0]?.title || "Featured"}</span>
                                        {product.images?.[0] ? <span className="absolute inset-3"><Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 24vw" className="rounded-lg object-cover" unoptimized={!canOptimizeImage(product.images[0])} /></span> : <div className="flex h-full items-center justify-center text-brand-navy"><ShoppingBag size={36} /></div>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className={`min-w-0 truncate text-lg ${dark ? "text-white" : "text-brand-navy"}`}>{product.name}</h3>
                                        <p className={`mt-1 line-clamp-2 min-h-10 font-body text-xs leading-5 ${dark ? "text-olympus" : "text-brand-navy-muted"}`}>{withBold(product.description ?? "", dark ? "font-semibold text-white" : "font-semibold text-brand-navy")}</p>
                                        <span className={`mt-3 inline-flex w-fit items-center gap-2 rounded-md bg-white px-3 py-2 font-body text-xs font-semibold ${accentText(product, false, "text-brand-navy")}`}>Explore <ArrowRight size={14} /></span>
                                    </div>
                                </Link>
                            </article>
                        </div>;
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
                <div className="h-px flex-1 overflow-hidden bg-olympus"><div className="h-full bg-brand-navy transition-all duration-700" style={{ width: `${(Math.min(position + shownCount, count) / count) * 100}%` }} /></div>
                <span className="font-body text-[10px] font-semibold tracking-widest text-brand-navy">{String(position + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            </div>
        </div>
    </section>;
}
