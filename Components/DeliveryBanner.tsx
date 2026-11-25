"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
    {
        src: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/alpha-male-delivery-tape.webp",
        alt: "Alpha Male branded tape sealing a plain navy shipping box",
    },
    {
        src: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/alpha-male-delivery-bags.webp",
        alt: "Two sealed Alpha Male branded delivery bags",
    },
];

const SLIDE_MS = 5000;

interface DeliveryBannerProps {
    /** Homepage shows "Shop now" (to /shop); the product page doesn't. */
    showShopButton?: boolean;
}

/**
 * "Discreet delivery" banner: text on the left (on top on phones) with the
 * packaging photos cross-fading behind/below it, advancing every 5 seconds.
 */
export default function DeliveryBanner({ showShopButton = false }: DeliveryBannerProps) {
    const [active, setActive] = useState(0);

    // Always auto-advances. Depending on `active` restarts the timer, so a
    // dot click gets a full 5 seconds before the next slide.
    useEffect(() => {
        const timer = window.setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
        return () => window.clearTimeout(timer);
    }, [active]);

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Discreet delivery"
            className="relative w-full overflow-hidden bg-brand-navy text-white"
        >
            <div className="relative flex flex-col lg:block lg:min-h-[520px]">

                {/* Photos: full-bleed behind the text on desktop, below it on phones */}
                <div className="relative order-2 aspect-[16/9] w-full lg:absolute lg:inset-0 lg:aspect-auto">
                    {SLIDES.map((slide, index) => (
                        <Image
                            key={slide.src}
                            src={slide.src}
                            alt={slide.alt}
                            fill
                            sizes="100vw"
                            aria-hidden={index !== active}
                            className={`object-cover object-center transition-[opacity,transform] duration-[1200ms] ease-in-out lg:object-right ${index === active ? "scale-100 opacity-100" : "opacity-0 motion-safe:scale-105"}`}
                        />
                    ))}

                    {/* Desktop: navy fade on the left so the text stays readable */}
                    <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-brand-navy via-brand-navy/80 to-transparent lg:block" />
                    {/* Phone: soft fade from the text block into the photo */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-navy to-transparent lg:hidden" />
                </div>

                {/* Text */}
                <div className="pdp-container relative z-10 order-1 flex flex-col items-center py-10 text-center lg:min-h-[520px] lg:items-start lg:justify-center lg:py-16 lg:text-left">
                    <Image
                        src="/images/logo.png"
                        alt="Alpha Male"
                        width={150}
                        height={150}
                        className="h-[72px] w-[72px] object-contain lg:h-[96px] lg:w-[96px]"
                    />

                    <h2 className="mt-5 font-heading text-3xl uppercase leading-tight tracking-[0.06em] text-white sm:text-4xl lg:text-5xl">
                        Discreet delivery
                    </h2>
                    <span aria-hidden="true" className="mt-4 block h-px w-40 bg-palladium/60 lg:w-72" />

                    <p className="mt-5 font-body text-sm text-olympus sm:text-base lg:text-lg">
                        No product name on the box
                    </p>
                    <p className="mt-1 font-body text-sm text-olympus sm:text-base lg:text-lg">
                        Discreet billing · Sealed, branded packaging
                    </p>

                    {showShopButton && (
                        <Link
                            href="/shop"
                            className="mt-7 inline-flex min-h-11 items-center rounded-md bg-white px-8 font-body text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy shadow-lg transition hover:bg-olympus"
                        >
                            Shop now
                        </Link>
                    )}

                    {/* Slide dots */}
                    <div className="mt-8 flex gap-2" role="group" aria-label="Choose photo">
                        {SLIDES.map((slide, index) => (
                            <button
                                key={slide.src}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={`Show photo ${index + 1} of ${SLIDES.length}`}
                                aria-current={index === active}
                                className={`h-2 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
