"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
} from "lucide-react";
import { productHref } from "@/lib/productUrl";

interface FeaturedProduct {
    slug?: string;
    _id: string;
    name: string;
    description: string;
    images: string[];
    bannerImages: string[];
    price: number;
    compareAtPrice?: number | null;
    taglines?: {
        title: string;
        description: string;
        image?: string;
    }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const controlClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50 md:h-12 md:w-12";

export default function FeaturedProducts() {
    const [products, setProducts] = useState<FeaturedProduct[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    const [userPaused, setUserPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/product/hero`, { cache: "no-store" });
                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();
                const rawProducts = Array.isArray(data) ? data : data.products ?? data.data ?? [];
                const validProducts = (rawProducts.flat(Infinity) as FeaturedProduct[]).filter(
                    (product) => product && typeof product === "object" && product._id && product.bannerImages?.[0]
                );
                setProducts(validProducts);
            } catch (fetchError) {
                console.error("Featured products error:", fetchError);
                setError("Unable to load featured products.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => {
            setReducedMotion(query.matches);
            setMotionPreferenceReady(true);
        };
        updatePreference();
        query.addEventListener("change", updatePreference);
        return () => query.removeEventListener("change", updatePreference);
    }, []);

    useEffect(() => {
        if (!motionPreferenceReady || products.length <= 1 || isHovered || hasFocus || userPaused || reducedMotion) return;

        const interval = window.setInterval(() => {
            setActiveIndex((previous) => (previous + 1) % products.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [products.length, isHovered, hasFocus, userPaused, reducedMotion, motionPreferenceReady]);

    const nextSlide = () => setActiveIndex((previous) => (previous + 1) % products.length);
    const previousSlide = () => setActiveIndex((previous) => (previous - 1 + products.length) % products.length);

    if (loading) {
        return (
            <section className="flex min-h-[360px] items-center justify-center bg-brand-navy md:min-h-[570px]" aria-label="Featured products">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-accent-gold" />
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-[300px] items-center justify-center bg-brand-navy px-5 text-center md:min-h-[350px]" aria-label="Featured products">
                <p className="font-body text-sm text-white/70">{error}</p>
            </section>
        );
    }

    if (!products.length) return null;

    const product = products[activeIndex];
    const setFocusWithin = () => setHasFocus(true);
    const clearFocusIfOutside = (event: React.FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocus(false);
    };

    const renderDots = () => products.map((item, index) => (
        <button
            type="button"
            key={item._id}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
        >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? "w-5 bg-accent-gold" : "w-2.5 bg-white/50"}`} />
        </button>
    ));

    const playPauseButton = (
        <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            disabled={!motionPreferenceReady || reducedMotion || products.length <= 1}
            aria-label={reducedMotion ? "Autoplay disabled by reduced motion preference" : userPaused ? "Play autoplay" : "Pause autoplay"}
            aria-pressed={userPaused || reducedMotion}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-55 md:h-11 md:w-11"
        >
            {userPaused || reducedMotion ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
    );

    return (
        <section
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured products"
            className="relative w-full overflow-hidden bg-brand-navy"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={setFocusWithin}
            onBlurCapture={clearFocusIfOutside}
        >
            <div
                key={product._id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${activeIndex + 1} of ${products.length}`}
            className="relative isolate mx-auto w-full max-w-[1450px] px-4 py-7 text-center sm:px-6 sm:py-10 lg:min-h-[650px] lg:px-28 lg:py-16 lg:text-left"
            >
                <img
                    src={product.bannerImages[0]}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-center lg:block"
                />
                <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#061329] via-[#061329]/85 to-[#061329]/10 lg:block" />
                <div className="absolute inset-0 -z-10 hidden bg-gradient-to-t from-[#061329]/60 via-transparent to-transparent lg:block" />

                <div className="relative mx-auto mb-5 h-[min(72vw,320px)] w-full max-w-[320px] lg:absolute lg:right-[11%] lg:top-1/2 lg:mb-0 lg:h-[82%] lg:w-[34%] lg:max-w-none lg:-translate-y-1/2">
                    {product.images?.[0] && (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] lg:drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
                        />
                    )}
                </div>

                <div className="relative z-10 w-full max-w-[580px] break-words text-left lg:max-w-[52%]">
                    <p className="mb-3 font-heading text-xs font-bold tracking-[0.25em] text-accent-gold sm:mb-5 sm:text-sm md:text-base md:tracking-[0.3em]">
                        ALPHA MALE
                    </p>
                    <p className="mb-2 font-body text-[9px] font-semibold uppercase tracking-[0.24em] text-white/70 sm:mb-3 sm:text-xs sm:tracking-[0.3em]">
                        DRIVE · STAMINA · ENERGY
                    </p>
                    <h2 className="max-w-full font-heading text-3xl font-semibold uppercase leading-[1.15] tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
                        {product.taglines?.[0]?.title || product.name}
                    </h2>
                    <p className="mt-3 max-w-full font-body text-xs leading-5 text-white/75 sm:mt-4 sm:text-sm sm:leading-7 md:text-base md:leading-8 lg:max-w-lg">
                        {product.taglines?.[0]?.description || product.description}
                    </p>
                    <p className="mt-3 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-accent-gold sm:mt-4 sm:text-xs sm:tracking-[0.2em]">
                        {product.name}
                    </p>
                    <Link
                        href={productHref(product)}
                        className="mt-5 inline-flex h-11 max-w-full items-center gap-3 rounded-xl border border-accent-gold px-5 font-body text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-accent-gold hover:text-brand-navy sm:mt-7 sm:h-14 sm:gap-4 sm:px-8 sm:text-sm sm:tracking-[0.15em]"
                    >
                        Explore Product <ArrowRight size={17} />
                    </Link>
                </div>

                <div className="relative z-20 mt-6 flex items-center justify-center gap-2 lg:hidden">
                    {products.length > 1 && (
                        <>
                            <button type="button" onClick={previousSlide} aria-label="Previous featured product" className={controlClass}>
                                <ChevronLeft size={21} />
                            </button>
                            <div className="flex max-w-[calc(100%-152px)] items-center justify-center gap-0.5 overflow-x-auto">{renderDots()}</div>
                            <button type="button" onClick={nextSlide} aria-label="Next featured product" className={controlClass}>
                                <ChevronRight size={21} />
                            </button>
                        </>
                    )}
                    {playPauseButton}
                </div>

                {products.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={previousSlide}
                            aria-label="Previous featured product"
                            className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-navy lg:left-6 lg:flex lg:h-12 lg:w-12"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next featured product"
                            className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-navy lg:right-6 lg:flex lg:h-12 lg:w-12"
                        >
                            <ChevronRight size={22} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-1 lg:flex">
                            {renderDots()}
                        </div>
                    </>
                )}
                <div className="absolute bottom-4 right-20 z-30 hidden lg:block">{playPauseButton}</div>
            </div>
        </section>
    );
}
