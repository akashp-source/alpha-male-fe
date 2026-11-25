import Image from "next/image";

import { canOptimizeImage } from "@/lib/image-hosts";

/**
 * "Our standard" badges: navy circles with an icon/photo and a label.
 * Product page: a centred row. Homepage: `marquee` slides the badges.
 *
 * TODO: add the image URLs below (S3 links from the admin Image library,
 * ideally square WebP, about 300×300 px and under 50 KB). Until a URL is set,
 * the circle shows an empty ring as a placeholder.
 */
const STANDARDS: { label: string; image: string }[] = [
    { label: "WHO-GMP certified facility", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/991a4707-d50a-4a10-8506-d2ac6411d584.webp" /* TODO: image URL */ },
    { label: "Own licensed manufacturing", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/528e33bd-b081-4ca7-9271-f9e301e12553.webp" /* TODO: image URL */ },
    { label: "Every batch tested before release", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/660f4f1b-3df3-4ff1-b95e-209160492cee.webp" /* TODO: image URL */ },
    { label: "Made in India", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/60736594-68bc-4a18-accf-98ac507698ec.webp" /* TODO: image URL */ },
    { label: "Plain, sealed parcel", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/b5696aa5-8c08-46e7-83d8-bcc7071d8785.webp" /* TODO: image URL */ },
    { label: "Secure payments · COD available", image: "https://alpha-male-mumbai.s3.ap-south-1.amazonaws.com/products/6af5afef82ff2dc6bab65f0b/a2890c2e-3020-4280-9564-a25368a0400c.webp" /* TODO: image URL */ },
];

// Marquee: each copy holds the badges this many times (wider than any screen).
const MARQUEE_REPEAT = 3;

function Badge({ label, image, hidden = false }: { label: string; image: string; hidden?: boolean }) {
    return (
        <li aria-hidden={hidden || undefined} className="flex w-[132px] shrink-0 flex-col items-center text-center sm:w-[150px]">
            <span className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-navy shadow-[0_10px_24px_rgba(33,46,73,0.25)] sm:h-28 sm:w-28">
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        sizes="112px"
                        unoptimized={!canOptimizeImage(image)}
                        className="object-cover"
                    />
                ) : (
                    // Placeholder ring until an image URL is added.
                    <span aria-hidden="true" className="relative h-[72%] w-[72%] rounded-full border border-white/40">
                        <span className="absolute left-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/70" />
                        <span className="absolute right-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/70" />
                    </span>
                )}
            </span>
            <p className="mt-4 font-body text-xs font-semibold leading-snug text-brand-navy sm:text-sm">{label}</p>
        </li>
    );
}

interface OurStandardProps {
    /** Homepage: badges slide continuously (pauses on hover). */
    marquee?: boolean;
}

export default function OurStandard({ marquee = false }: OurStandardProps) {
    return (
        <section className="pdp-section w-full bg-white text-brand-navy">
            <div className="pdp-container text-center">
                <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">
                    Our standard
                </p>
                <h2 className="font-heading text-3xl leading-tight text-brand-navy sm:text-4xl">
                    Made by us. Held to a higher standard.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-brand-navy-muted sm:text-base">
                    Every strip is made in our own licensed facility that follows WHO Good Manufacturing
                    Practice — from raw material checks to batch release.
                </p>
            </div>

            {marquee ? (
                // Same seamless loop as the best-sellers marquee (globals.css):
                // the list is rendered twice and moved by half its width.
                // Each copy carries its own trailing gap so -50% lands exactly.
                // Each copy repeats the badges MARQUEE_REPEAT times so it's wider
                // than any screen; otherwise a gap shows before the loop restarts.
                <div className="bestseller-marquee-wrap mt-10">
                    <div
                        className="bestseller-marquee flex w-max"
                        // Duration grows with the repeats so the speed stays the same.
                        style={{ "--marquee-duration": `${35 * MARQUEE_REPEAT}s` } as React.CSSProperties}
                    >
                        <ul className="flex gap-6 pr-6 sm:gap-10 sm:pr-10">
                            {Array.from({ length: MARQUEE_REPEAT }, (_, round) =>
                                STANDARDS.map((item) => (
                                    // Only the first round is read out by screen readers.
                                    <Badge key={`${round}-${item.label}`} {...item} hidden={round > 0} />
                                )),
                            )}
                        </ul>
                        <ul data-duplicate aria-hidden="true" className="flex gap-6 pr-6 sm:gap-10 sm:pr-10">
                            {Array.from({ length: MARQUEE_REPEAT }, (_, round) =>
                                STANDARDS.map((item) => (
                                    <Badge key={`copy-${round}-${item.label}`} {...item} />
                                )),
                            )}
                        </ul>
                    </div>
                </div>
            ) : (
                <ul className="pdp-container mt-10 flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-6 lg:flex-nowrap lg:justify-between">
                    {STANDARDS.map((item) => (
                        <Badge key={item.label} {...item} />
                    ))}
                </ul>
            )}
        </section>
    );
}
