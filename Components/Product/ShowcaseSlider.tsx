"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { canOptimizeImage } from "@/lib/image-hosts";

export type ShowcaseSlide = { image: string; mobileImage?: string };

const INTERVAL_MS = 2000;
const SLIDE_MS = 700; // keep in step with duration-700 below

const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Two frames: lets the browser paint a jump before the next animated move. */
const afterPaint = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

interface ShowcaseSliderProps {
    slides: ShowcaseSlide[];
    alt: string;
    navy: boolean;
}

/**
 * Showcase banner photos sliding every 2 seconds. Pauses on hover, keyboard
 * focus, a hidden tab, the pause button, and for "reduce motion" users.
 * Swipe or the dots to pick a photo.
 */
export default function ShowcaseSlider({ slides, alt, navy }: ShowcaseSliderProps) {
    // Seamless loop: a copy of photo 1 sits after the last photo. Last -> first
    // slides forward onto the copy, then jumps (no animation) to the real photo 1,
    // so it never rewinds back past every photo.
    const [pos, setPos] = useState(0); // 0..count (count = the copy)
    const [animated, setAnimated] = useState(true);
    const [playing, setPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const touchX = useRef<number | null>(null);
    const busy = useRef(false); // a loop jump is in progress
    const count = slides.length;
    const index = pos % count; // the real photo shown (for dots)

    // Landed on the copy: jump to the real photo 1 once the slide finishes.
    useEffect(() => {
        if (pos !== count || count < 2) return;
        busy.current = true;
        const timer = window.setTimeout(() => {
            setAnimated(false);
            setPos(0);
            afterPaint(() => {
                setAnimated(true);
                busy.current = false;
            });
        }, SLIDE_MS);
        return () => window.clearTimeout(timer);
    }, [pos, count]);

    const next = () => {
        if (busy.current) return;
        if (reducedMotion()) {
            setAnimated(false);
            setPos((current) => (current + 1) % count);
            return;
        }
        setAnimated(true);
        setPos((current) => Math.min(current + 1, count));
    };

    const prev = () => {
        if (busy.current) return;
        if (index > 0 || reducedMotion()) {
            setAnimated(!reducedMotion());
            setPos((index - 1 + count) % count);
            return;
        }
        // First -> last: jump to the copy of photo 1 (looks identical), then slide back one.
        busy.current = true;
        setAnimated(false);
        setPos(count);
        afterPaint(() => {
            setAnimated(true);
            setPos(count - 1);
            busy.current = false;
        });
    };

    const goTo = (dot: number) => {
        if (busy.current || dot === index) return;
        setAnimated(!reducedMotion());
        setPos(dot);
    };

    // Autoplay every 2 seconds (not while hovered / focused / paused / tab hidden / reduced motion).
    const nextRef = useRef(next);
    useEffect(() => {
        nextRef.current = next;
    });
    useEffect(() => {
        if (!playing || hovered || focused || count < 2) return;
        const timer = window.setInterval(() => {
            if (document.hidden || reducedMotion()) return;
            nextRef.current();
        }, INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [playing, hovered, focused, count]);

    // Real photos plus the copy of photo 1 at the end.
    const track = count > 1 ? [...slides, slides[0]] : slides;

    // Phone photos are 4:5; without any, every screen uses 16:9.
    const hasMobile = slides.some((slide) => slide.mobileImage);
    const frame = hasMobile ? "aspect-[4/5] sm:aspect-video" : "aspect-video";

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Photos"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
            }}
        >
            <div
                className={`relative overflow-hidden rounded-3xl ${navy ? "shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10" : "shadow-[0_18px_40px_rgba(33,46,73,0.18)]"}`}
                onTouchStart={(event) => {
                    touchX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                    const start = touchX.current;
                    touchX.current = null;
                    const end = event.changedTouches[0]?.clientX;
                    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
                    if (end < start) next();
                    else prev();
                }}
            >
                <div
                    className={`flex ${animated ? "transition-transform duration-700 ease-out" : ""} motion-reduce:transition-none`}
                    style={{ transform: `translateX(-${pos * 100}%)` }}
                >
                    {track.map((slide, slideIndex) => (
                        <div
                            key={`${slide.image}-${slideIndex}`}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${(slideIndex % count) + 1} of ${count}`}
                            // The copy is only for the loop animation.
                            aria-hidden={slideIndex !== pos || slideIndex === count}
                            className={`relative w-full shrink-0 ${frame}`}
                        >
                            {slide.mobileImage ? (
                                <>
                                    <Image unoptimized={!canOptimizeImage(slide.mobileImage)} src={slide.mobileImage} alt={alt} fill sizes="100vw"
                                        priority={slideIndex === 0} className="object-cover sm:hidden" />
                                    <Image unoptimized={!canOptimizeImage(slide.image)} src={slide.image} alt={alt} fill sizes="(max-width: 1200px) 100vw, 1100px"
                                        priority={slideIndex === 0} className="hidden object-cover sm:block" />
                                </>
                            ) : (
                                <Image unoptimized={!canOptimizeImage(slide.image)} src={slide.image} alt={alt} fill sizes="(max-width: 1200px) 100vw, 1100px"
                                    priority={slideIndex === 0} className="object-cover" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Previous / next arrows over the photo */}
                {count > 1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous photo"
                            onClick={prev}
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/90 hover:text-brand-navy focus-visible:bg-white/90 focus-visible:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-5 sm:h-12 sm:w-12"
                        >
                            <ChevronLeft size={22} aria-hidden="true" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
                        </button>
                        <button
                            type="button"
                            aria-label="Next photo"
                            onClick={next}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/90 hover:text-brand-navy focus-visible:bg-white/90 focus-visible:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:h-12 sm:w-12"
                        >
                            <ChevronRight size={22} aria-hidden="true" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
                        </button>
                    </>
                )}
            </div>

            {count > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1">
                        {slides.map((_, dot) => (
                            <button
                                key={dot}
                                type="button"
                                aria-label={`Show photo ${dot + 1}`}
                                aria-current={dot === index ? "true" : undefined}
                                onClick={() => goTo(dot)}
                                className="flex h-6 items-center px-1"
                            >
                                <span
                                    className={`block h-1.5 rounded-full transition-all ${dot === index ? "w-6" : "w-1.5 opacity-40"} ${navy ? "bg-white" : "bg-brand-navy"}`}
                                />
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                        onClick={() => setPlaying((value) => !value)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${navy ? "border-white/25 text-white hover:bg-white/10" : "border-olympus text-brand-navy hover:bg-pale-gray"}`}
                    >
                        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
                    </button>
                </div>
            )}
        </div>
    );
}
