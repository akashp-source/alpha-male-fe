
"use client";

import Image from "next/image";
import { useState } from "react";

// ==========================================
// PRODUCT DATA
// ==========================================

const performanceProducts = [
    {
        name: "ALPHA BOLD",
        image: "/images/products/alpha-bold.png",
        type: "ORAL STRIPS",
        info: "s 25mg - Where confidence beigns.",
        status: "blurred" as const,
    },
    {
        name: "ALPHA BOSS",
        image: "/images/products/alpha-boss.png",
        type: "ORAL STRIPS",
        info: "s 50mg - Command the moment.",
        status: "blurred" as const,
    },
    {
        name: "ALPHA LEGEND",
        image: "/images/products/alpha-legend.png",
        type: "ORAL STRIPS",
        info: "T 10mg - legends don't rush.",
        status: "blurred" as const,
    },
    {
        name: "ALPHA ICON",
        image: "/images/products/alpha-icon.png",
        type: "ORAL STRIPS",
        info: "T 20mg - made for the long night.",
        status: "blurred" as const,
    },
];

const wellnessProducts = [
    {
        name: "SHILAJIT",
        image: "/images/products/shilajit.png",
        type: "ORAL STRIPS",
        status: "blurred" as const,
    },
    {
        name: "CAFFEINE",
        image: "/images/products/caffeine.png",
        type: "ORAL STRIPS",
        status: "blurred" as const,
    },
];

const intimacyProducts = [
    {
        name: "LONG PLAY",
        image: "/images/products/long-play.png",
        type: "EXTRA DELAY CONDOMS",
        status: "blurred" as const,
    },
    {
        name: "BARE",
        image: "/images/products/bare.png",
        type: "ULTRA THIN CONDOMS",
        status: "blurred" as const,
    },
    {
        name: "DELAY SPRAY",
        image: "/images/products/delay-spray.png",
        type: "20 g",
        status: "blurred" as const,
    },
    {
        name: "CHERRY & STRAWBERRY",
        image: "/images/products/cherry-strawberry.png",
        type: "WATER BASED LUBE",
        status: "blurred" as const,
    },
];

// ==========================================
// TYPES
// ==========================================

type Product = {
    name: string;
    image: string;
    type: string;
    info?: string;
    status?: "blurred" | "revealed";
};

// ==========================================
// PRODUCT CARD
// Desktop: Tailwind hover
// Mobile: Single tap to toggle
// ==========================================

function ProductCard({ product }: { product: Product }) {
    const [isRevealed, setIsRevealed] = useState(
        product.status === "revealed"
    );

    return (
        <button
            type="button"
            aria-label={`${product.name} - ${isRevealed ? "Revealed" : "Blurred"}`}
            aria-pressed={isRevealed}
            onClick={() => {
                setIsRevealed((prev) => !prev);
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="
                group flex w-full min-w-0
                cursor-pointer select-none
                flex-col items-center text-center
                outline-none
            "
            style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
            }}
        >
            {/* Product Image */}
            <div className="relative aspect-[3/4] w-full max-w-[190px] overflow-hidden sm:max-w-[205px]">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 205px"
                    draggable={false}
                    className={`
                        pointer-events-none object-contain
                        transition-all duration-500 ease-in-out

                        ${isRevealed
                            ? "blur-none opacity-100 scale-100"
                            : "blur-[6px] opacity-50 scale-95"
                        }

                        md:group-hover:!blur-none
                        md:group-hover:!opacity-100
                        md:group-hover:!scale-100
                    `}
                />
            </div>

            {/* Product Name */}
            <h3 className="mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E0E0E2] sm:text-[12px]">
                {product.name}
            </h3>

            {/* Product Type */}
            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[#929BAE] sm:text-[9px]">
                {product.type}
            </p>

            {/* Product Information */}
            {product.info && (
                <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[#929BAE] sm:text-[9px]">
                    {product.info}
                </p>
            )}

            {/* Reveal Hint */}
            <span className="mt-2 text-[7px] uppercase tracking-[0.18em] text-[#78859C]">
                {isRevealed ? "REVEALED" : "TAP / HOVER TO REVEAL"}
            </span>
        </button>
    );
}


// function ProductCard({ product }: { product: Product }) {
//     return (
//         <button
//             type="button"
//             onTouchStart={() => alert("TOUCH START WORKED")}
//             onTouchEnd={() => alert("TOUCH END WORKED")}
//             onClick={() => alert("CLICK WORKED")}
//             className="flex w-full flex-col items-center border border-red-500 p-4"
//             style={{
//                 touchAction: "manipulation",
//                 WebkitTapHighlightColor: "transparent",
//             }}
//         >

//             <Image
//                 src={product.image}
//                 alt={product.name}
//                 width={150}
//                 height={200}
//                 draggable={false}
//             />

//             <p className="text-white">{product.name}</p>
//         </button>
//     );
// }

// ==========================================
// PRODUCT CATEGORY
// ==========================================

function ProductCategory({
    title,
    subtitle,
    products,
    columns,
}: {
    title: string;
    subtitle: string;
    products: Product[];
    columns: string;
}) {
    return (
        <section className="mb-12 sm:mb-14">

            {/* Category Heading */}
            <div className="mb-5 text-center">

                {/* <div className="mx-auto mb-3 h-px w-12 bg-gradient-to-r from-transparent via-palladium to-transparent" /> */}

                <h2 className="font-heading text-xl uppercase tracking-[0.19em] text-olympus sm:text-2xl">
                    {title}
                </h2>

                <p className="mt-2 text-[8px] uppercase tracking-[0.28em] text-[#929BAE] sm:text-[9px]">
                    {subtitle}
                </p>

            </div>

            {/* Products Grid */}
            <div
                className={`mx-auto grid ${columns} items-start justify-items-center gap-4 sm:gap-6`}
            >
                {products.map((product) => (
                    <ProductCard
                        key={product.name}
                        product={product}
                    />
                ))}
            </div>

        </section>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function LaunchingSoon() {
    return (
        <main
            id="products"
            className="relative min-h-screen scroll-mt-6 overflow-hidden px-5 pb-16 text-olympus sm:px-8"
        >

            {/* Decorative Borders */}
            <div className="pointer-events-none absolute inset-y-0 left-3 border-l hidden sm:block border-white/[0.06] sm:left-6" />

            <div className="pointer-events-none absolute inset-y-0 right-3 border-r border-white/[0.06] sm:right-6" />

            <div className="relative mx-auto max-w-[1000px]">

                {/* Hero */}
                <header className="flex flex-col items-center pb-12 pt-12 text-center sm:pb-14 sm:pt-16">

                    <p className="mb-3 text-[9px] uppercase tracking-[0.38em] text-palladium">
                        THE WAIT IS ALMOST OVER
                    </p>

                    <h1 className="silver-text font-heading font-semibold text-[clamp(35px,6vw,58px)] uppercase tracking-[0.12em]">
                        Launching Soon
                    </h1>

                    <p className="mt-3 max-w-[500px] text-[11px] leading-6 text-palladium sm:text-[13px] font-body font-normal">
                        India's first premium science-backed men's wellness brand
                    </p>

                    {/* <div className="mt-5 h-px w-16 bg-gradient-to-r from-transparent via-palladium to-transparent" /> */}

                </header>

                {/* Performance Strips */}
                <ProductCategory
                    title="Performance Strips"
                    subtitle="ORAL STRIPS | FAST-DISSOLVING | DISCREET"
                    products={performanceProducts}
                    columns="grid-cols-2 sm:grid-cols-4"
                />

                {/* Daily Wellness */}
                <ProductCategory
                    title="Daily Wellness"
                    subtitle="ORAL STRIPS | EVERYDAY ENERGY & VITALITY"
                    products={wellnessProducts}
                    columns="grid-cols-2 max-w-[400px]"
                />

                {/* Sexual Wellness */}
                <ProductCategory
                    title="Sexual Wellness"
                    subtitle="CONDOMS | DELAY SPRAY | LUBRICANT"
                    products={intimacyProducts}
                    columns="grid-cols-2 sm:grid-cols-4"
                />

                {/* Footer */}
                <footer className="border-t border-white/[0.08] pt-8 text-center">

                    <p className="font-serif text-[13px] uppercase tracking-[0.35em] text-olympus">
                        ALPHA MALE
                    </p>

                    <p className="mt-2 text-[8px] uppercase tracking-[0.3em] text-[#929BAE]">
                        alphamale.co.in
                    </p>

                </footer>

            </div>
        </main>
    );
}
