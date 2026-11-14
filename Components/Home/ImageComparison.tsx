
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ImageComparisonProps {
    leftImage: string;
    rightImage: string;
    leftLabel?: string;
    rightLabel?: string;
    leftHref: string;
    rightHref: string;
    title?: string;
    description?: string;
}

export default function ImageComparison({
    leftImage,
    rightImage,
    leftLabel = "ALPHA BOLD",
    rightLabel = "ALPHA BOSS",
    leftHref,
    rightHref,
    title = "Experience the Difference",
    description = "Discover the Alpha Male collection and find the product that suits your routine.",
}: ImageComparisonProps) {
    const [position, setPosition] = useState(50);

    return (
        <section className="bg-[#faf7f2] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">

            <div className="mx-auto max-w-[1200px]">

                {/* Heading */}
                <div className="mb-7 text-center sm:mb-10">
                    <p className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.35em] text-[#176348] sm:text-xs">
                        DISCOVER THE COLLECTION
                    </p>

                    <h2 className="font-heading text-2xl font-bold text-[#211b17] sm:text-4xl lg:text-5xl">
                        {title}
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl font-body text-xs leading-6 text-[#91857b] sm:text-base sm:leading-7">
                        {description}
                    </p>
                </div>

                {/* Comparison */}
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[1100px] select-none overflow-hidden rounded-lg bg-[#eeeae4] sm:aspect-[16/9] sm:rounded-xl">

                    {/* Left Image */}
                    <Image
                        src={leftImage}
                        alt={leftLabel}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 1100px"
                        draggable={false}
                        className="pointer-events-none object-contain"
                    />

                    {/* Right Image */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            clipPath: `inset(0 0 0 ${position}%)`,
                        }}
                    >
                        <Image
                            src={rightImage}
                            alt={rightLabel}
                            fill
                            sizes="(max-width: 768px) 100vw, 1100px"
                            draggable={false}
                            className="object-contain"
                        />
                    </div>

                    {/* Center Divider */}
                    <div
                        className="pointer-events-none absolute bottom-0 top-0 z-20 w-[2px] bg-white shadow-lg"
                        style={{
                            left: `${position}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-[#17120f] shadow-xl sm:h-14 sm:w-14">
                            <svg
                                width="26"
                                height="18"
                                viewBox="0 0 26 18"
                                fill="none"
                            >
                                <path
                                    d="M8 3L3 9L8 15M18 3L23 9L18 15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Bottom Left Product Link */}
                    <div className="absolute bottom-3 left-3 z-40 sm:bottom-7 sm:left-8">
                        <p className="mb-1 font-body text-xs font-medium text-[#211b17] sm:text-lg">
                            {leftLabel}
                        </p>

                        <Link
                            href={leftHref}
                            className="inline-block border-b border-[#211b17] pb-0.5 font-body text-[10px] text-[#211b17] transition-colors hover:border-[#176348] hover:text-[#176348] sm:text-sm"
                        >
                            View product
                        </Link>
                    </div>

                    {/* Bottom Right Product Link */}
                    <div className="absolute bottom-3 right-3 z-40 text-right sm:bottom-7 sm:right-8">
                        <p className="mb-1 font-body text-xs font-medium text-[#211b17] sm:text-lg">
                            {rightLabel}
                        </p>

                        <Link
                            href={rightHref}
                            className="inline-block border-b border-[#211b17] pb-0.5 font-body text-[10px] text-[#211b17] transition-colors hover:border-[#176348] hover:text-[#176348] sm:text-sm"
                        >
                            View product
                        </Link>
                    </div>

                    {/* Slider Input */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={position}
                        onChange={(e) =>
                            setPosition(Number(e.target.value))
                        }
                        aria-label="Drag to compare products"
                        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
                    />

                </div>

                {/* Instruction */}
                <p className="mt-5 text-center font-body text-[10px] font-medium uppercase tracking-[0.2em] text-[#91857b] sm:text-xs">
                    ↔ Drag to explore
                </p>

            </div>
        </section>
    );
}
