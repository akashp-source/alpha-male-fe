
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface FeaturedProduct {
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

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export default function FeaturedProducts() {
    const [products, setProducts] = useState<FeaturedProduct[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // -----------------------------------
    // Fetch Featured Products
    // -----------------------------------

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${API_URL}/product/hero`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `API Error: ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("Featured API Response:", data);

                // Extract products
                const rawProducts = Array.isArray(data)
                    ? data
                    : data.products ?? data.data ?? [];

                // Handle nested API arrays
                const flattenedProducts =
                    rawProducts.flat(Infinity) as FeaturedProduct[];

                // Validate products
                const validProducts = flattenedProducts.filter(
                    (product) =>
                        product &&
                        typeof product === "object" &&
                        product._id &&
                        product.bannerImages?.[0]
                );

                console.log(
                    "Processed Featured Products:",
                    validProducts
                );

                setProducts(validProducts);
            } catch (err) {
                console.error(
                    "Featured products error:",
                    err
                );

                setError("Unable to load featured products.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    // -----------------------------------
    // Automatic Slider
    // -----------------------------------

    useEffect(() => {
        if (products.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) =>
                (prev + 1) % products.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [products.length]);

    // -----------------------------------
    // Slider Navigation
    // -----------------------------------

    const nextSlide = () => {
        setActiveIndex(
            (prev) => (prev + 1) % products.length
        );
    };

    const previousSlide = () => {
        setActiveIndex(
            (prev) =>
                (prev - 1 + products.length) % products.length
        );
    };

    // -----------------------------------
    // Loading
    // -----------------------------------

    if (loading) {
        return (
            <section className="flex min-h-[450px] items-center justify-center bg-[#07162f] sm:min-h-[550px]">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-[#d6b47e]" />
            </section>
        );
    }

    // -----------------------------------
    // Error
    // -----------------------------------

    if (error) {
        return (
            <section className="flex min-h-[350px] items-center justify-center bg-[#07162f] px-5 text-center">
                <p className="font-body text-sm text-white/70">
                    {error}
                </p>
            </section>
        );
    }

    if (!products.length) return null;

    const product = products[activeIndex];

    return (
        <section className="relative w-full overflow-hidden bg-[#07162f]">

            {/* Slider Container */}
            <div className="relative min-h-[540px] sm:min-h-[570px] lg:min-h-[650px]">

                {/* -----------------------------------
                    Background Slides
                ----------------------------------- */}

                {products.map((item, index) => (
                    <div
                        key={item._id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex
                            ? "z-10 opacity-100"
                            : "z-0 opacity-0"
                            }`}
                    >
                        {/* Background Banner */}
                        <img
                            src={item.bannerImages[0]}
                            alt={`${item.name} banner`}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#061329] via-[#061329]/85 to-[#061329]/10" />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#061329]/60 via-transparent to-transparent" />

                        {/* -----------------------------------
                            DESKTOP PRODUCT IMAGE
                        ----------------------------------- */}

                        {item.images?.[0] && (
                            <div className="pointer-events-none absolute right-[4%] top-1/2 z-10 hidden h-[88%] w-[40%] -translate-y-1/2 items-center justify-center lg:flex">
                                <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="h-full w-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out"
                                />
                            </div>
                        )}

                        {/* -----------------------------------
                            MOBILE PRODUCT IMAGE
                        ----------------------------------- */}

                        {item.images?.[0] && (
                            <div className="pointer-events-none absolute bottom-3 right-1 z-10 flex h-[38%] w-[40%] items-center justify-center sm:bottom-5 sm:h-[43%] sm:w-[35%] lg:hidden">
                                <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* -----------------------------------
                    PRODUCT CONTENT
                ----------------------------------- */}

                <div className="relative z-20 mx-auto flex min-h-[540px] max-w-[1450px] items-center px-6 py-16 sm:min-h-[570px] sm:px-10 lg:min-h-[650px] lg:px-16">

                    <div className="w-full max-w-[580px]">

                        {/* Brand */}
                        <p className="mb-5 font-heading text-sm font-bold tracking-[0.3em] text-[#d6b47e] sm:text-base">
                            ALPHA MALE
                        </p>

                        {/* Brand Tagline */}
                        <p className="mb-3 font-body text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                            DRIVE · STAMINA · ENERGY
                        </p>

                        {/* Product Heading */}
                        <h1
                            key={`title-${product._id}`}
                            className="animate-[fadeIn_0.8s_ease-out] max-w-[95%] font-heading text-3xl font-bold uppercase leading-[1.2] tracking-wide text-white sm:text-5xl lg:text-6xl"
                        >
                            {product.taglines?.[0]?.title ||
                                product.name}
                        </h1>

                        {/* Description */}
                        <p
                            key={`description-${product._id}`}
                            className="mt-4 max-w-[90%] font-body text-xs leading-6 text-white/75 sm:mt-5 sm:text-base sm:leading-8 lg:max-w-lg"
                        >
                            {product.taglines?.[0]?.description ||
                                product.description}
                        </p>

                        {/* Product Name */}
                        <p className="mt-4 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#d6b47e] sm:mt-5 sm:text-xs">
                            {product.name}
                        </p>

                        {/* Explore Button */}
                        <Link
                            href={`/products/${product._id}`}
                            className="mt-6 inline-flex h-11 items-center gap-3 border border-[#d6b47e] px-5 font-body text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#d6b47e] hover:text-[#07162f] sm:mt-8 sm:h-14 sm:gap-4 sm:px-8 sm:text-sm rounded-xl"
                        >
                            Explore Product
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>

                {/* -----------------------------------
                    PREVIOUS / NEXT BUTTONS
                ----------------------------------- */}

                {products.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={previousSlide}
                            aria-label="Previous featured product"
                            className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#07162f] sm:left-6 sm:h-12 sm:w-12"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next featured product"
                            className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#07162f] sm:right-6 sm:h-12 sm:w-12"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}

                {/* -----------------------------------
                    SLIDE INDICATORS
                ----------------------------------- */}

                {products.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
                        {products.map((item, index) => (
                            <button
                                type="button"
                                key={item._id}
                                onClick={() =>
                                    setActiveIndex(index)
                                }
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === index
                                    ? "w-10 bg-[#d6b47e]"
                                    : "w-5 bg-white/50 hover:bg-white"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* -----------------------------------
                    SLIDE COUNTER
                ----------------------------------- */}

                {products.length > 1 && (
                    <div className="absolute bottom-6 right-6 z-30 hidden font-body text-xs tracking-widest text-white/80 sm:block">
                        {String(activeIndex + 1).padStart(2, "0")}
                        <span className="mx-2 text-white/40">
                            /
                        </span>
                        {String(products.length).padStart(2, "0")}
                    </div>
                )}
            </div>
        </section>
    );
}
