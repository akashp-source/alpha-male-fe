"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { FeaturedProduct } from "@/lib/featured-products";
import { productHref } from "@/lib/productUrl";
import { canOptimizeImage } from "@/lib/image-hosts";
import { withBold } from "@/lib/inline-bold";
import { accentText, THEME_BACKGROUND, themeOf, useAutoplay } from "@/lib/featured-theme";

/** Time each product stays before the spotlight moves on. */
const AUTOPLAY_MS = 2000;

export default function FeaturedConceptB({ products }: { products: FeaturedProduct[] | null }) {
    const [active, setActive] = useState(0);
    const count = products?.length ?? 0;
    const step = (delta: number) => setActive((value) => (value + delta + count) % count);

    const { stopped, toggle, pauseProps } = useAutoplay({
        enabled: count > 1,
        delay: AUTOPLAY_MS,
        step: () => step(1),
        resetKey: active,
    });

    if (!products?.length) return null;
    const product = products[active];

    // Right panel: the product's page theme; no theme = the original navy.
    const theme = themeOf(product);
    const dark = theme === "" || theme === "navy";
    const themes = Array.from(new Set(products.map(themeOf)));
    const label = accentText(product, dark, dark ? "text-palladium" : "text-brand-navy-muted");

    return <section aria-label="Featured products, spotlight concept" aria-roledescription="carousel" {...pauseProps} className="bg-pale-gray px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-navy-muted">Spotlight · Concept B</p><h2 className="text-3xl text-brand-navy sm:text-4xl">Our Featured Products</h2></div>
                <div className="flex items-center gap-2"><span className="mr-2 font-body text-xs font-semibold tracking-widest text-brand-navy">{String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
                    {products.length > 1 && <button type="button" onClick={toggle} aria-label={stopped ? "Play featured products slideshow" : "Pause featured products slideshow"} className="rounded-full border border-brand-navy/20 bg-white p-2.5 text-brand-navy hover:bg-brand-navy hover:text-white">{stopped ? <Play size={18} /> : <Pause size={18} />}</button>}
                    <button type="button" onClick={() => step(-1)} aria-label="Previous featured product" className="rounded-full border border-brand-navy/20 bg-white p-2.5 text-brand-navy hover:bg-brand-navy hover:text-white"><ChevronLeft size={18} /></button><button type="button" onClick={() => step(1)} aria-label="Next featured product" className="rounded-full bg-brand-navy p-2.5 text-white hover:bg-brand-navy/85"><ChevronRight size={18} /></button></div></div>
            <article className="grid overflow-hidden rounded-2xl border border-olympus bg-white shadow-sm md:grid-cols-2">
                <div key={`image-${product._id}`} className="featured-fade-up relative min-h-[280px] bg-olympus sm:min-h-[420px]">{product.bannerImages[0] && <Image src={product.bannerImages[0]} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized={!canOptimizeImage(product.bannerImages[0])} />}{product.images?.[0] && <div className="absolute inset-0"><Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-8 drop-shadow-xl" unoptimized={!canOptimizeImage(product.images[0])} /></div>}</div>
                <div className={`relative isolate flex flex-col justify-center overflow-hidden p-6 transition-colors duration-700 sm:p-10 lg:p-14 ${dark ? "text-white" : "text-brand-navy"}`}>
                    {/* One layer per theme, cross-faded so the colour changes smoothly. */}
                    {themes.map((key) => <div key={key || "default"} aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-700 ${THEME_BACKGROUND[key] ?? "bg-brand-navy"} ${key === theme ? "opacity-100" : "opacity-0"}`} />)}
                    <div key={`text-${product._id}`} aria-live={stopped ? "polite" : "off"} className="featured-fade-up">
                        <p className={`font-body text-[10px] font-semibold uppercase tracking-[0.28em] ${label}`}>{product.taglines?.[0]?.title || "Featured product"}</p>
                        <h3 className={`mt-3 text-3xl sm:text-5xl ${dark ? "text-white" : "text-brand-navy"}`}>{product.name}</h3>
                        <p className={`mt-5 line-clamp-3 font-body text-sm leading-7 ${dark ? "text-olympus" : "text-brand-navy-muted"}`}>{withBold(product.taglines?.[0]?.description || product.description || "", dark ? "font-semibold text-white" : "font-semibold text-brand-navy")}</p>
                    </div>
                    <Link href={productHref(product)} className={`mt-8 inline-flex w-fit items-center gap-3 rounded-md px-5 py-3 font-body text-sm font-semibold transition ${dark ? "bg-white text-brand-navy hover:bg-olympus" : "bg-brand-navy text-white hover:bg-[#14284d]"}`}>Explore product <ArrowRight size={17} /></Link>
                </div>
            </article>
            {products.length > 1 && <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{products.map((item, index) => <button key={item._id} type="button" onClick={() => setActive(index)} aria-label={`Show ${item.name}`} aria-current={active === index ? "true" : undefined} className={`overflow-hidden rounded-lg border bg-white text-left transition ${active === index ? "border-brand-navy ring-1 ring-brand-navy" : "border-olympus hover:border-brand-navy/50"}`}><span className="relative block aspect-[1.5] bg-pale-gray">{item.images?.[0] && <Image src={item.images[0]} alt="" fill sizes="(max-width: 640px) 30vw, 16vw" className="object-contain p-1" unoptimized={!canOptimizeImage(item.images[0])} />}</span><span className="block truncate px-2 py-1.5 font-body text-[10px] font-semibold uppercase tracking-wider text-brand-navy">{item.name}</span></button>)}</div>}
        </div>
    </section>;
}
