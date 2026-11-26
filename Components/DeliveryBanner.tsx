"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { canOptimizeImage } from "@/lib/image-hosts";

/**
 * Photos that slide in the banner. TO ADD MORE: add another { src, alt }
 * line below (any number works; dots are added automatically).
 * Best: 16:9 WebP (e.g. 1600×900), under ~200 KB, uploaded through the admin
 * Image library; paste its S3 link as `src`. `alt` describes the photo for
 * screen readers.
 */
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
 * "Discreet delivery" banner: text on the left, photos sliding on the right
 * (desktop); text above the photos on phones. Advances every 5 seconds.
 */
export default function DeliveryBanner({ showShopButton = false }: DeliveryBannerProps) {
    const [active, setActive] = useState(0);

    // Always auto-advances. Depending on `active` restarts the timer, so a
    // dot click gets a full 5 seconds before the next slide.
    useEffect(() => {
        if (SLIDES.length < 2) return;
        const timer = window.setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
        return () => window.clearTimeout(timer);
    }, [active]);

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Discreet delivery"
            className="relative w-full overflow-hidden bg-brand-navy py-12 text-white sm:py-16 lg:py-0"
        >
            <div className="pdp-container grid grid-cols-1 items-center gap-8 lg:min-h-[460px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">

                {/* Text (left on desktop, top on phones) */}
                <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:justify-center lg:py-16 lg:text-left">
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
                    {SLIDES.length > 1 && (
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
                    )}
                </div>

                {/* Photos. Phones: 16:9 below the text, fading in/out top and
                    bottom. Desktop: fills the right side of the banner, full
                    height and right up to the screen edge; only its left edge
                    fades into the navy behind the text. */}
                <div className="relative aspect-[16/9] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_85%,transparent)] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[56%] lg:[mask-image:linear-gradient(to_right,transparent,black_22%)]">
                    {SLIDES.map((slide, index) => (
                        <Image
                            key={slide.src}
                            src={slide.src}
                            alt={slide.alt}
                            fill
                            sizes="(min-width: 1024px) 56vw, 100vw"
                            unoptimized={!canOptimizeImage(slide.src)}
                            aria-hidden={index !== active}
                            className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-in-out ${index === active ? "scale-100 opacity-100" : "opacity-0 motion-safe:scale-105"}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
