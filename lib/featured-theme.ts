"use client";

// Shared by the homepage featured-product concepts (Components/Home/FeaturedConcept*):
// product page-theme colours and auto-play with pause / reduced-motion support.

import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent } from "react";

import type { FeaturedProduct } from "@/lib/featured-products";

/** Background per product page theme (admin → Page theme), same colours as the product page. */
export const THEME_BACKGROUND: Record<string, string> = {
    navy: "bg-brand-navy",
    light: "bg-white",
    pale: "bg-pale-gray",
    blush: "bg-blush",
    cream: "bg-cream",
    teal: "bg-teal-soft bg-[radial-gradient(ellipse_at_50%_100%,var(--color-teal-soft-light),var(--color-teal-soft)_70%)]",
    sand: "bg-sand bg-[radial-gradient(ellipse_at_50%_100%,var(--color-sand-light),var(--color-sand)_70%)]",
    mint: "bg-mint bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mint-light),var(--color-mint)_70%)]",
    petal: "bg-petal bg-[radial-gradient(ellipse_at_50%_100%,var(--color-petal-light),var(--color-petal)_70%)]",
    mist: "bg-mist bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mist-light),var(--color-mist)_70%)]",
};

/** Accent text colour: [on light backgrounds, on navy]. AA on their backgrounds. */
export const ACCENT_TEXT: Record<string, [string, string]> = {
    rose: ["text-accent-rose", "text-accent-rose-light"],
    orange: ["text-accent-orange", "text-accent-orange-light"],
    gold: ["text-accent-gold-deep", "text-accent-gold-light"],
    emerald: ["text-accent-emerald", "text-accent-emerald-light"],
    wine: ["text-accent-wine", "text-accent-wine-light"],
};

/** The product's page theme, or "" when it has none (each concept picks its own default). */
export const themeOf = (product: FeaturedProduct) =>
    product.pageTheme && THEME_BACKGROUND[product.pageTheme] ? product.pageTheme : "";

/** Accent class for a label, or `fallback` when the product has no accent. */
export const accentText = (product: FeaturedProduct, dark: boolean, fallback: string) => {
    const accent = ACCENT_TEXT[product.pageAccent ?? ""];
    return accent ? accent[dark ? 1 : 0] : fallback;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
};

/** Matches a media query (false on the server). */
export function useMediaQuery(query: string) {
    return useSyncExternalStore(
        (onChange) => {
            const list = window.matchMedia(query);
            list.addEventListener("change", onChange);
            return () => list.removeEventListener("change", onChange);
        },
        () => window.matchMedia(query).matches,
        () => false,
    );
}

/**
 * Auto-play: calls `step` every `delay` ms while `enabled`. The timer restarts
 * whenever `resetKey` changes (e.g. the active slide), so a manual change gets
 * a full `delay`. Pauses on hover / keyboard focus (spread `pauseProps` on the
 * carousel; it also holds the ref that tracks whether the carousel is on
 * screen) and can be stopped with `toggle` (a pause / play button). With
 * reduced motion it starts stopped.
 */
export function useAutoplay({ enabled, delay, step, resetKey }: { enabled: boolean; delay: number; step: () => void; resetKey: unknown }) {
    const [hovered, setHovered] = useState(false);
    // Only auto-play while the carousel is on screen (at least half visible)
    // and the tab is open; scrolling past it or away stops it.
    const [section, setSection] = useState<HTMLElement | null>(null);
    const [onScreen, setOnScreen] = useState(false);
    const pageVisible = useSyncExternalStore(
        (onChange) => {
            document.addEventListener("visibilitychange", onChange);
            return () => document.removeEventListener("visibilitychange", onChange);
        },
        () => document.visibilityState === "visible",
        () => false,
    );

    useEffect(() => {
        if (!section) return;
        const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.5 });
        observer.observe(section);
        return () => observer.disconnect();
    }, [section]);
    const [playChoice, setPlayChoice] = useState<boolean | null>(null);
    const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
    const stopped = playChoice === null ? reducedMotion : !playChoice;

    const stepRef = useRef(step);
    useEffect(() => {
        stepRef.current = step;
    });

    useEffect(() => {
        if (!enabled || hovered || stopped || !onScreen || !pageVisible) return;
        const timer = window.setTimeout(() => stepRef.current(), delay);
        return () => window.clearTimeout(timer);
    }, [enabled, hovered, stopped, onScreen, pageVisible, delay, resetKey]);

    const pauseProps = {
        ref: setSection,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: (event: FocusEvent<HTMLElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
        },
    };

    return { stopped, toggle: () => setPlayChoice(stopped), pauseProps };
}
