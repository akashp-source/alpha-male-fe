"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImageLightboxProps {
    images: string[];
    name: string;
    /** Image to open on. */
    startIndex: number;
    /** Closed; gets the image the user ended on (to sync the gallery). */
    onClose: (index: number) => void;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Full-screen product images. Swipe (phones), ← / → keys, the arrow buttons
 * or the thumbnails move between images; Escape, the X or a click on the dark
 * background closes it. Page scrolling is locked while it's open and focus
 * goes back to where it was when it closes.
 */
export default function ProductImageLightbox({ images, name, startIndex, onClose }: ProductImageLightboxProps) {
    const count = images.length;
    const [active, setActive] = useState(() => Math.max(0, Math.min(count - 1, startIndex)));
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    // Latest index for the key / close handlers (kept in sync below).
    const activeRef = useRef(active);
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    const close = useCallback(() => onClose(activeRef.current), [onClose]);

    // Only a swipe / drag / trackpad scroll by the user changes the image from
    // the scroll position. Arrow keys and buttons set it directly (their
    // smooth scroll passes through the images in between, which must not
    // count, or quick key presses would be lost).
    const userScrollRef = useRef(false);
    const startUserScroll = useCallback(() => {
        userScrollRef.current = true;
    }, []);
    const endUserScroll = useCallback(() => {
        userScrollRef.current = false;
    }, []);

    const goTo = useCallback(
        (index: number) => {
            const track = trackRef.current;
            if (!track || !count) return;
            const next = Math.max(0, Math.min(count - 1, index));
            userScrollRef.current = false;
            track.scrollTo({ left: next * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
            activeRef.current = next;
            setActive(next);
        },
        [count],
    );

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const starts = ["touchstart", "pointerdown", "wheel"] as const;
        starts.forEach((type) => track.addEventListener(type, startUserScroll, { passive: true }));
        track.addEventListener("scrollend", endUserScroll);
        return () => {
            starts.forEach((type) => track.removeEventListener(type, startUserScroll));
            track.removeEventListener("scrollend", endUserScroll);
        };
    }, [startUserScroll, endUserScroll]);

    // Open on the clicked image (no animation), focus the close button.
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (track) track.scrollLeft = activeRef.current * track.clientWidth;
        closeRef.current?.focus({ preventScroll: true });
    }, []);

    // Lock page scroll; restore it and the previous focus on close.
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        document.documentElement.setAttribute("data-lightbox-open", "");
        return () => {
            document.body.style.overflow = overflow;
            document.documentElement.removeAttribute("data-lightbox-open");
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, []);

    // Keyboard: arrows / Home / End move, Escape closes, Tab stays inside.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goTo(activeRef.current + 1);
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                goTo(activeRef.current - 1);
            } else if (event.key === "Home") {
                event.preventDefault();
                goTo(0);
            } else if (event.key === "End") {
                event.preventDefault();
                goTo(count - 1);
            } else if (event.key === "Tab") {
                const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [close, goTo, count]);

    // Keep the snap point after a resize / rotation.
    useEffect(() => {
        const onResize = () => {
            const track = trackRef.current;
            if (track) track.scrollLeft = activeRef.current * track.clientWidth;
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Keep the active thumbnail in view.
    useEffect(() => {
        const strip = thumbsRef.current;
        const thumb = strip?.children[active] as HTMLElement | undefined;
        if (!strip || !thumb) return;
        strip.scrollTo({
            left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }, [active]);

    // Swiping: follow the scroll position.
    const onScroll = () => {
        const track = trackRef.current;
        if (!track || !track.clientWidth || !userScrollRef.current) return;
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index !== activeRef.current) {
            activeRef.current = index;
            setActive(index);
        }
    };

    return createPortal(
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} images, full screen`}
            className="fixed inset-0 z-[100] flex flex-col bg-[#0b1220]/95 text-white backdrop-blur-sm"
        >
            {/* Top bar: counter + close */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <span className="font-body text-sm font-semibold text-white/80" aria-live="polite">
                    {active + 1} / {count}
                </span>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Close full screen"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Images: swipeable track; a click on the background closes */}
            <div className="relative min-h-0 flex-1">
                <div
                    ref={trackRef}
                    onScroll={onScroll}
                    className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-contain"
                >
                    {images.map((image, index) => (
                        <div
                            key={`${image}-${index}`}
                            onClick={(event) => {
                                if (event.target === event.currentTarget) close();
                            }}
                            aria-hidden={index !== active}
                            className="flex h-full w-full shrink-0 snap-center items-center justify-center px-2 sm:px-16"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={image}
                                alt={index === 0 ? name : `${name} - image ${index + 1}`}
                                draggable={false}
                                loading={Math.abs(index - active) <= 1 ? "eager" : "lazy"}
                                className="max-h-full max-w-full select-none rounded-lg object-contain"
                            />
                        </div>
                    ))}
                </div>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => goTo(active - 1)}
                            disabled={active === 0}
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-0 sm:flex"
                        >
                            <ChevronLeft size={26} />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(active + 1)}
                            disabled={active === count - 1}
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-0 sm:flex"
                        >
                            <ChevronRight size={26} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {count > 1 && (
                <div
                    ref={thumbsRef}
                    className="no-scrollbar mx-auto flex max-w-full gap-2 overflow-x-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3"
                >
                    {images.map((image, index) => (
                        <button
                            type="button"
                            key={`${image}-${index}`}
                            onClick={() => goTo(index)}
                            aria-label={`Show image ${index + 1} of ${count}`}
                            aria-current={index === active}
                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white/5 p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-16 sm:w-16 ${index === active ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body,
    );
}
