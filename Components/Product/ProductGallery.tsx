"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Package } from "lucide-react";

import ProductImageLightbox from "./ProductImageLightbox";

interface ProductGalleryProps {
    images: string[];
    name: string;
    // Small label over the main image, e.g. "Pack of 10 strips".
    badge?: string;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Product image gallery.
 * - Phone: swipe the main image (native scroll-snap), dots + counter.
 * - Desktop: click an image or thumbnail, then use ← / → to change image;
 *   prev/next buttons show on hover.
 */
export default function ProductGallery({ images, name, badge }: ProductGalleryProps) {
    const list = images.filter(Boolean);
    const [active, setActive] = useState(0);
    // Full-screen viewer: the image it opened on, or null when closed.
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<HTMLDivElement>(null);
    const count = list.length;

    /** Scroll the main track to image `index` (clamped). */
    const goTo = useCallback(
        (index: number) => {
            const track = trackRef.current;
            if (!track || !count) return;
            const next = Math.max(0, Math.min(count - 1, index));
            track.scrollTo({
                left: next * track.clientWidth,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
            setActive(next);
        },
        [count],
    );

    // Keep the active index in sync while the user swipes / scrolls.
    const onScroll = () => {
        const track = trackRef.current;
        if (!track || !track.clientWidth) return;
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index !== active) setActive(index);
    };

    // Keep the active thumbnail visible in the thumbnail strip.
    useEffect(() => {
        const strip = thumbsRef.current;
        const thumb = strip?.children[active] as HTMLElement | undefined;
        if (!strip || !thumb) return;
        const left = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
        strip.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }, [active]);

    // After a resize the snap point moves: realign to the active image.
    useEffect(() => {
        const handle = () => {
            const track = trackRef.current;
            if (track) track.scrollLeft = active * track.clientWidth;
        };
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
    }, [active]);

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Enter on the gallery (not on a button inside it) opens full screen.
        if (event.key === "Enter" && event.target === event.currentTarget) {
            event.preventDefault();
            setLightboxIndex(active);
            return;
        }
        if (count < 2) return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(active + 1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(active - 1);
        } else if (event.key === "Home") {
            event.preventDefault();
            goTo(0);
        } else if (event.key === "End") {
            event.preventDefault();
            goTo(count - 1);
        }
    };

    if (!count) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl sm:rounded-[20px] lg:max-h-[460px]">
                <Package size={70} className="text-white/30" />
            </div>
        );
    }

    return (
        // Focusable region: clicking an image or thumbnail focuses it, so the
        // arrow keys then move between images.
        <div
            ref={galleryRef}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={`${name} images`}
            onKeyDown={onKeyDown}
            className="group/gallery rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40 focus-visible:ring-offset-2"
        >
            {/* Main images: swipeable track */}
            <div className="relative">
                {badge && (
                    <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-navy shadow-sm sm:text-xs">
                        {badge}
                    </span>
                )}
                <div
                    ref={trackRef}
                    onScroll={onScroll}
                    onClick={() => {
                        galleryRef.current?.focus({ preventScroll: true });
                        setLightboxIndex(active);
                    }}
                    className="no-scrollbar flex aspect-square w-full cursor-zoom-in snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl sm:rounded-[20px] lg:max-h-[460px]"
                >
                    {list.map((image, index) => (
                        <div
                            key={`${image}-${index}`}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} of ${count}`}
                            aria-hidden={index !== active}
                            className="flex h-full w-full shrink-0 snap-center items-center justify-center p-0 sm:p-1 lg:p-4"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={image}
                                alt={index === 0 ? name : `${name} - image ${index + 1}`}
                                loading={index === 0 ? "eager" : "lazy"}
                                draggable={false}
                                className="h-full w-full select-none object-contain"
                            />
                        </div>
                    ))}
                </div>

                {/* Full screen */}
                <button
                    type="button"
                    onClick={() => setLightboxIndex(active)}
                    aria-label="View images full screen"
                    className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-md transition hover:bg-white"
                >
                    <Expand size={16} />
                </button>

                {count > 1 && (
                    <>
                        {/* Desktop prev / next (on hover or keyboard focus) */}
                        <button
                            type="button"
                            onClick={() => goTo(active - 1)}
                            disabled={active === 0}
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-md opacity-0 transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 group-hover/gallery:opacity-100 group-focus-within/gallery:opacity-100 lg:flex"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(active + 1)}
                            disabled={active === count - 1}
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-md opacity-0 transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 group-hover/gallery:opacity-100 group-focus-within/gallery:opacity-100 lg:flex"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Counter */}
                        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-navy/75 px-2.5 py-1 font-body text-[11px] font-semibold text-white">
                            {active + 1} / {count}
                        </span>

                        {/* Phone: dots */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
                            {list.map((_, index) => (
                                <span
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all ${index === active ? "w-5 bg-brand-navy" : "w-1.5 bg-brand-navy/30"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {count > 1 && (
                <div ref={thumbsRef} className="no-scrollbar mt-2 flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
                    {list.map((image, index) => (
                        <button
                            type="button"
                            key={`${image}-${index}`}
                            onClick={() => goTo(index)}
                            aria-label={`Show image ${index + 1} of ${count}`}
                            aria-current={index === active}
                            className={`h-11 min-h-11 w-11 min-w-11 shrink-0 overflow-hidden rounded-lg border-2 p-1.5 transition sm:h-16 sm:w-16 ${index === active ? "border-brand-navy" : "border-transparent hover:border-brand-navy/30"}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />
                        </button>
                    ))}
                </div>
            )}

            {count > 1 && (
                <p className="mt-1 hidden font-body text-[11px] text-brand-navy-muted lg:block">
                    Click an image to view it full screen; use ← → to browse.
                </p>
            )}

            {lightboxIndex !== null && (
                <ProductImageLightbox
                    images={list}
                    name={name}
                    startIndex={lightboxIndex}
                    onClose={(index) => {
                        setLightboxIndex(null);
                        // Leave the gallery on the image the user ended on.
                        goTo(index);
                    }}
                />
            )}
        </div>
    );
}
