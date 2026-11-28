"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { productHref } from "@/lib/productUrl";
import { canOptimizeImage } from "@/lib/image-hosts";
import type { FeaturedProduct } from "@/lib/featured-products";

export default function HomeHeroCarousel({ products }: { products: FeaturedProduct[] | null }) {
    const [activeIndex, setActiveIndex] = useState(0);
    if (!products?.length) return null;

    const product = products[activeIndex];
    const title = product.taglines?.[0]?.title || product.name;
    const description = product.taglines?.[0]?.description || product.description;
    const previous = () => setActiveIndex((index) => (index - 1 + products.length) % products.length);
    const next = () => setActiveIndex((index) => (index + 1) % products.length);

    return (
        <section aria-label="Featured products" className="bg-white px-4 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
            <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-olympus bg-pale-gray lg:min-h-[520px] lg:grid-cols-[1.02fr_0.98fr]">
                <div className="relative flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
                    <div className="mb-6 flex items-center gap-3 text-brand-navy-muted">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-navy"><Sparkles size={17} /></span>
                        <span className="font-body text-xs font-semibold uppercase tracking-[0.22em]">Drive · Stamina · Energy</span>
                    </div>
                    <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-navy-muted">Featured formula</p>
                    <h2 className="max-w-xl text-4xl leading-tight text-brand-navy sm:text-5xl lg:text-6xl">{title}</h2>
                    <p className="mt-5 max-w-lg font-body text-sm leading-7 text-brand-navy-muted sm:text-base">{description}</p>
                    <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy">{product.name}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link href={productHref(product)} className="group inline-flex min-h-12 items-center gap-3 rounded-lg bg-brand-navy px-6 font-body text-sm font-semibold text-white transition hover:bg-brand-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
                            Explore product <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        {products.length > 1 && <div className="flex items-center gap-2" aria-label={`Slide ${activeIndex + 1} of ${products.length}`}>
                            {products.map((item, index) => <button key={item._id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show ${item.name}`} aria-current={index === activeIndex ? "true" : undefined} className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${index === activeIndex ? "w-8 bg-brand-navy" : "w-2.5 bg-medium-gray hover:bg-brand-navy/60"}`} />)}
                        </div>}
                    </div>
                </div>

                <div key={product._id} className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-olympus px-8 py-8 sm:min-h-[390px] lg:min-h-full">
                    {product.bannerImages[0] && <Image src={product.bannerImages[0]} alt="" fill priority={activeIndex === 0} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-20" unoptimized={!canOptimizeImage(product.bannerImages[0])} />}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/45 to-olympus/80" />
                    <div className="relative h-[270px] w-full max-w-[420px] sm:h-[360px] lg:h-[420px]">
                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill priority={activeIndex === 0} sizes="(max-width: 1024px) 90vw, 40vw" className="object-contain drop-shadow-xl" unoptimized={!canOptimizeImage(product.images[0])} />}
                    </div>
                    {products.length > 1 && <div className="absolute bottom-5 right-5 flex gap-2 sm:bottom-7 sm:right-7">
                        <button type="button" onClick={previous} aria-label="Previous featured product" className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/20 bg-white text-brand-navy transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"><ChevronLeft size={20} /></button>
                        <button type="button" onClick={next} aria-label="Next featured product" className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/20 bg-white text-brand-navy transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"><ChevronRight size={20} /></button>
                    </div>}
                </div>
            </div>
        </section>
    );
}
