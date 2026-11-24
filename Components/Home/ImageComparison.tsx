
"use client";

import { useState, useRef, useCallback } from "react";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updatePosition = useCallback((clientX: number) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();

        const nextPosition =
            ((clientX - rect.left) / rect.width) * 100;

        setPosition(Math.max(0, Math.min(100, nextPosition)));
    }, []);

    const handlePointerDown = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        // Don't start dragging when clicking product links
        if ((e.target as HTMLElement).closest("a")) return;

        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
    };

    const handlePointerMove = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        if (!isDragging.current) return;

        updatePosition(e.clientX);
    };

    const handlePointerUp = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        isDragging.current = false;

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    return (
        <section className="bg-pale-gray px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">

            <div className="mx-auto max-w-[1200px]">

                {/* Heading */}
                <div className="mb-7 text-center sm:mb-10">
                    <p className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.35em] text-success-green sm:text-xs">
                        DISCOVER THE COLLECTION
                    </p>

                    <h2 className="font-heading text-2xl font-semibold text-brand-navy sm:text-4xl lg:text-5xl">
                        {title}
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl font-body text-xs leading-6 text-brand-navy-muted sm:text-base sm:leading-7">
                        {description}
                    </p>
                </div>

                {/* Comparison Container */}
                <div
                    ref={containerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative mx-auto aspect-[4/3] w-full max-w-[1100px] select-none overflow-hidden rounded-lg bg-pale-gray touch-pan-y sm:aspect-[16/9] sm:rounded-xl"
                    style={{
                        cursor: isDragging.current ? "grabbing" : "ew-resize",
                    }}
                >

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
                        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-brand-navy shadow-xl sm:h-14 sm:w-14">
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
                    <div className="pointer-events-none absolute bottom-3 left-3 z-40 sm:bottom-7 sm:left-8">
                        <p className="mb-1 font-body text-xs font-medium text-brand-navy sm:text-lg">
                            {leftLabel}
                        </p>

                        <Link
                            href={leftHref}
                            className="pointer-events-auto inline-block border-b border-brand-navy pb-0.5 font-body text-[10px] text-brand-navy transition-colors hover:border-success-green hover:text-success-green sm:text-sm"
                        >
                            View product
                        </Link>
                    </div>

                    {/* Bottom Right Product Link */}
                    <div className="pointer-events-none absolute bottom-3 right-3 z-40 text-right sm:bottom-7 sm:right-8">
                        <p className="mb-1 font-body text-xs font-medium text-brand-navy sm:text-lg">
                            {rightLabel}
                        </p>

                        <Link
                            href={rightHref}
                            className="pointer-events-auto inline-block border-b border-brand-navy pb-0.5 font-body text-[10px] text-brand-navy transition-colors hover:border-success-green hover:text-success-green sm:text-sm"
                        >
                            View product
                        </Link>
                    </div>

                </div>

                {/* Instruction */}
                <p className="mt-5 text-center font-body text-[10px] font-medium uppercase tracking-[0.2em] text-brand-navy-muted sm:text-xs">
                    <span className="mr-2">↔</span>
                    Drag anywhere to compare
                </p>

            </div>
        </section>
    );
}
