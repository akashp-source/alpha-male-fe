"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { FeaturedProduct } from "@/lib/featured-products";
import { productHref } from "@/lib/productUrl";
import { canOptimizeImage } from "@/lib/image-hosts";
import { accentText, THEME_BACKGROUND, themeOf, useAutoplay } from "@/lib/featured-theme";

/** Time each product stays before the slider moves on. */
const AUTOPLAY_MS = 2000;

// No page theme = the original navy design.
const backgroundOf = (theme: string) => THEME_BACKGROUND[theme] ?? "bg-brand-navy";

export default function FeaturedConceptC({ products }: { products: FeaturedProduct[] | null }) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    // No flip on first load, only when the product changes.
    const [moved, setMoved] = useState(false);
    const count = products?.length ?? 0;

    const show = (index: number, dir: "next" | "prev") => {
        setDirection(dir);
        setMoved(true);
        setActive(index);
    };
    const move = (delta: number) => show((active + delta + count) % count, delta > 0 ? "next" : "prev");

    const { stopped, toggle, pauseProps } = useAutoplay({
        enabled: count > 1,
        delay: AUTOPLAY_MS,
        step: () => move(1),
        resetKey: active,
    });

    if (!products?.length) return null;

    const indexAt = (offset: number) => (active + offset + products.length) % products.length;
    const current = products[active];
    const theme = themeOf(current);
    const dark = theme === "" || theme === "navy";
    const labelClass = accentText(current, dark, dark ? "text-palladium" : "text-brand-navy-muted");

    const themes = Array.from(new Set(products.map(themeOf)));
    const sideCard = `absolute hidden h-[70%] w-[24%] overflow-hidden rounded-xl sm:block transition-colors duration-700 ${dark ? "bg-olympus opacity-35" : "bg-white/70 opacity-60"}`;
    const arrow = `absolute z-20 rounded-full border p-2.5 backdrop-blur transition sm:p-3 ${dark
        ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-brand-navy"
        : "border-brand-navy/20 bg-white/60 text-brand-navy hover:bg-brand-navy hover:text-white"}`;

    return <section
        aria-label="Featured products, coverflow concept"
        aria-roledescription="carousel"
        {...pauseProps}
        className={`relative isolate overflow-hidden px-4 py-12 transition-colors duration-700 sm:px-8 sm:py-14 lg:px-12 ${dark ? "text-white" : "text-brand-navy"}`}
    >
        {/* One layer per theme, cross-faded so the background changes smoothly. */}
        {themes.map((key) => <div key={key || "default"} aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-700 ${backgroundOf(key)} ${key === theme ? "opacity-100" : "opacity-0"}`} />)}

        <div className="mx-auto max-w-7xl text-center"><p className={`mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.32em] ${dark ? "text-palladium" : "text-brand-navy-muted"}`}>The collection · Concept C</p><h2 className="text-3xl sm:text-4xl">Our Featured Products</h2>
            <div className="relative mx-auto mt-8 flex h-[280px] max-w-5xl items-center justify-center sm:h-[400px]">
                {products.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Previous featured product" className={`${arrow} left-0 sm:left-3`}><ChevronLeft size={20} /></button>}
                {products.length > 2 && <div className={`${sideCard} left-[8%]`}>{products[indexAt(-1)].images?.[0] && <Image src={products[indexAt(-1)].images[0]} alt="" fill sizes="24vw" className="object-contain p-3" unoptimized={!canOptimizeImage(products[indexAt(-1)].images[0])} />}</div>}
                <div key={current._id} className={`relative h-full w-[70%] max-w-[420px] overflow-hidden rounded-2xl border bg-white p-3 shadow-2xl sm:w-[44%] ${dark ? "border-white/20" : "border-brand-navy/10"} ${moved ? (direction === "next" ? "featured-flip-next" : "featured-flip-prev") : ""}`}>{current.images?.[0] && <Image src={current.images[0]} alt={current.name} fill sizes="(max-width: 640px) 70vw, 420px" className="object-contain p-3" unoptimized={!canOptimizeImage(current.images[0])} />}</div>
                {products.length > 2 && <div className={`${sideCard} right-[8%]`}>{products[indexAt(1)].images?.[0] && <Image src={products[indexAt(1)].images[0]} alt="" fill sizes="24vw" className="object-contain p-3" unoptimized={!canOptimizeImage(products[indexAt(1)].images[0])} />}</div>}
                {products.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Next featured product" className={`${arrow} right-0 sm:right-3`}><ChevronRight size={20} /></button>}
            </div>
            <div key={`text-${current._id}`} aria-live={stopped ? "polite" : "off"} className={moved ? "featured-fade-up" : ""}>
                <p className={`mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.24em] ${labelClass}`}>{current.taglines?.[0]?.title || "Featured product"}</p><h3 className="mt-1 text-2xl tracking-[0.12em] sm:text-4xl sm:tracking-[0.16em]">{current.name}</h3>
            </div>
            <Link href={productHref(current)} className={`mt-5 inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-body text-sm font-semibold transition ${dark ? "border-white/40 text-white hover:bg-white hover:text-brand-navy" : "border-brand-navy/40 text-brand-navy hover:bg-brand-navy hover:text-white"}`}>Explore product <ArrowRight size={16} /></Link>
            {/* Phones: one swipeable row of names; larger screens: wrapped and centred. */}
            <div className="no-scrollbar -mx-4 mt-6 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
                {products.length > 1 && <button type="button" onClick={toggle} aria-label={stopped ? "Play featured products slideshow" : "Pause featured products slideshow"} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-brand-navy/25 text-brand-navy hover:bg-brand-navy/5"}`}>{stopped ? <Play size={13} /> : <Pause size={13} />}</button>}
                {products.map((item, index) => <button key={item._id} type="button" onClick={() => index !== active && show(index, index > active ? "next" : "prev")} aria-label={`Show ${item.name}`} aria-current={active === index ? "true" : undefined} className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-wider transition ${active === index
                    ? (dark ? "border-white bg-white text-brand-navy" : "border-brand-navy bg-brand-navy text-white")
                    : (dark ? "border-white/30 text-white hover:bg-white/10" : "border-brand-navy/25 text-brand-navy hover:bg-brand-navy/5")}`}>{item.name}</button>)}
            </div>
        </div>
    </section>;
}
