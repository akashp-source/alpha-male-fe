import Image from "next/image";
import Link from "next/link";
import { canOptimizeImage } from "@/lib/image-hosts";
import ShowcaseSlider from "@/Components/Product/ShowcaseSlider";

import type { Product } from "@/types/product";

type StoryBanner = NonNullable<Product["storyBanners"]>[number];

interface ProductStoryBannersProps {
    header?: Product["storyHeader"];
    banners?: Product["storyBanners"];
    /** Product page theme, for banners set to "Same as product". */
    pageTheme?: string;
    pageAccent?: string;
}

// Background + text colours per theme (brand tokens only).
const THEME = {
    light: { section: "bg-white text-brand-navy", muted: "text-brand-navy-muted", line: "border-olympus", number: "text-palladium" },
    pale: { section: "bg-pale-gray text-brand-navy", muted: "text-brand-navy-muted", line: "border-olympus", number: "text-medium-gray" },
    navy: { section: "bg-brand-navy text-white", muted: "text-olympus", line: "border-white/15", number: "text-white/35" },
    blush: { section: "bg-blush text-brand-navy", muted: "text-brand-navy-muted", line: "border-accent-rose/25", number: "text-accent-rose/40" },
    cream: { section: "bg-cream text-brand-navy", muted: "text-brand-navy-muted", line: "border-accent-orange/25", number: "text-accent-orange/40" },
    // Soft mint teal with a lighter glow (old deep teal was too dark):
    // teal: { section: "bg-teal-deep text-white", muted: "text-olympus", line: "border-white/15", number: "text-white/35" },
    teal: {
        section: "bg-teal-soft bg-[radial-gradient(ellipse_at_50%_100%,var(--color-teal-soft-light),var(--color-teal-soft)_70%)] text-brand-navy",
        muted: "text-brand-navy-muted",
        line: "border-brand-navy/15",
        number: "text-brand-navy/30",
    },
    // Boss / Icon / Legend / Bold: light backgrounds from the pack photos.
    sand: {
        section: "bg-sand bg-[radial-gradient(ellipse_at_50%_100%,var(--color-sand-light),var(--color-sand)_70%)] text-brand-navy",
        muted: "text-brand-navy-muted",
        line: "border-accent-gold-deep/25",
        number: "text-accent-gold-deep/40",
    },
    mint: {
        section: "bg-mint bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mint-light),var(--color-mint)_70%)] text-brand-navy",
        muted: "text-brand-navy-muted",
        line: "border-accent-emerald/25",
        number: "text-accent-emerald/40",
    },
    petal: {
        section: "bg-petal bg-[radial-gradient(ellipse_at_50%_100%,var(--color-petal-light),var(--color-petal)_70%)] text-brand-navy",
        muted: "text-brand-navy-muted",
        line: "border-accent-wine/25",
        number: "text-accent-wine/40",
    },
    mist: {
        section: "bg-mist bg-[radial-gradient(ellipse_at_50%_100%,var(--color-mist-light),var(--color-mist)_70%)] text-brand-navy",
        muted: "text-brand-navy-muted",
        line: "border-brand-navy/15",
        number: "text-brand-navy/30",
    },
} as const;

/** Dark backgrounds: white text, light buttons and pills. */
const isDark = (theme?: string) => theme === "navy";

const themeOf = (banner: StoryBanner) => THEME[banner.theme as keyof typeof THEME] ?? THEME.light;

/** Accent colour for labels, numbers and lines ("" = inherit the theme's text colour). */
const ACCENTS = {
    rose: {
        light: { text: "text-accent-rose", bg: "bg-accent-rose", border: "border-accent-rose" },
        dark: { text: "text-accent-rose-light", bg: "bg-accent-rose-light", border: "border-accent-rose-light" },
    },
    orange: {
        light: { text: "text-accent-orange", bg: "bg-accent-orange", border: "border-accent-orange" },
        dark: { text: "text-accent-orange-light", bg: "bg-accent-orange-light", border: "border-accent-orange-light" },
    },
    gold: {
        light: { text: "text-accent-gold-deep", bg: "bg-accent-gold-deep", border: "border-accent-gold-deep" },
        dark: { text: "text-accent-gold-light", bg: "bg-accent-gold-light", border: "border-accent-gold-light" },
    },
    emerald: {
        light: { text: "text-accent-emerald", bg: "bg-accent-emerald", border: "border-accent-emerald" },
        dark: { text: "text-accent-emerald-light", bg: "bg-accent-emerald-light", border: "border-accent-emerald-light" },
    },
    wine: {
        light: { text: "text-accent-wine", bg: "bg-accent-wine", border: "border-accent-wine" },
        dark: { text: "text-accent-wine-light", bg: "bg-accent-wine-light", border: "border-accent-wine-light" },
    },
} as const;

function accentOf(banner: StoryBanner) {
    const accent = ACCENTS[banner.accent as keyof typeof ACCENTS];
    if (!accent) return { text: "", bg: "bg-current", border: "border-current" };
    return isDark(banner.theme) ? accent.dark : accent.light;
}

/** Short centred rule under a title. */
function Divider({ className }: { className: string }) {
    return <span aria-hidden="true" className={`mx-auto mt-5 block h-px w-14 opacity-60 ${className}`} />;
}

/** Optional banner button. No link = scroll to the buy box (#buy). */
function BannerCta({ banner, className }: { banner: StoryBanner; className: string }) {
    if (!banner.ctaLabel) return null;
    const href = banner.ctaHref || "#buy";
    const classes = `inline-flex min-h-11 items-center justify-center rounded-full px-7 font-body text-[11px] font-bold uppercase tracking-[0.18em] transition ${className}`;
    if (href.startsWith("#")) {
        return <a href={href} className={classes}>{banner.ctaLabel}</a>;
    }
    if (/^https?:/i.test(href)) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{banner.ctaLabel}</a>;
    }
    return <Link href={href} className={classes}>{banner.ctaLabel}</Link>;
}

const eyebrowClass = "font-body text-[12px] font-semibold uppercase tracking-[0.22em]";

/** Big decorative number, e.g. "01" (the banner title carries the meaning). */
function BannerNumber({ value, className }: { value?: string; className: string }) {
    if (!value) return null;
    return (
        <p aria-hidden="true" className={`font-heading text-5xl font-normal leading-none sm:text-6xl ${className}`}>
            {value}
        </p>
    );
}

/** 01 layout: image card on the left, text + stats row on the right. */
function FeatureBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    return (
        <div className="pdp-container grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
            {banner.image && (
                // Image keeps its own shape (no fixed box), so nothing is cropped or zoomed.
                <div className="relative overflow-hidden rounded-3xl bg-pale-gray shadow-[0_18px_40px_rgba(33,46,73,0.18)]">
                    <Image unoptimized={!canOptimizeImage(banner.image)} src={banner.image}
                        alt={banner.imageAlt || ""}
                        width={1200}
                        height={900}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="block h-auto w-full"
                    />
                    {banner.imageBadge && (
                        <span className={`absolute bottom-4 left-4 rounded-full bg-white px-3.5 py-1.5 text-brand-navy shadow ${eyebrowClass} tracking-[0.16em]`}>
                            {banner.imageBadge}
                        </span>
                    )}
                </div>
            )}
            <div>
                <BannerNumber value={banner.number} className={theme.number} />
                {banner.eyebrow && <p className={`${eyebrowClass} mt-4 ${accentOf(banner).text}`}>{banner.eyebrow}</p>}
                <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
                {banner.body && <p className={`mt-4 whitespace-pre-line font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}
                {banner.items.length > 0 && (
                    <dl className={`mt-7 grid border-y ${theme.line}`} style={{ gridTemplateColumns: `repeat(${banner.items.length}, minmax(0, 1fr))` }}>
                        {banner.items.map((item, index) => (
                            <div key={index} className={`py-4 pr-3 ${index > 0 ? `border-l pl-4 ${theme.line}` : ""}`}>
                                <dt className="font-heading text-lg leading-tight sm:text-xl">{item.title}</dt>
                                <dd className={`mt-1 font-body text-xs ${theme.muted}`}>{item.text}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </div>
    );
}

/** 02 layout: centred intro, then round step photos. */
function StepsBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    return (
        <div className="pdp-container text-center">
            <BannerNumber value={banner.number} className={theme.number} />
            {banner.eyebrow && <p className={`${eyebrowClass} mt-4`}>{banner.eyebrow}</p>}
            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
            {banner.body && <p className={`mx-auto mt-4 max-w-xl whitespace-pre-line font-body text-sm leading-relaxed ${theme.muted}`}>{banner.body}</p>}
            {banner.items.length > 0 && (
                // Phones: steps side by side with small photos (3 per row, 2 when there are 4),
                // so the banner stays short. Tablet/desktop unchanged.
                <ol className={`mt-12 grid gap-12 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-28 xl:gap-36 max-sm:mt-8 max-sm:gap-x-3 max-sm:gap-y-7 ${banner.items.length === 4 ? "max-sm:grid-cols-2" : "max-sm:grid-cols-3"}`}>
                    {banner.items.map((item, index) => (
                        <li key={index} className="flex min-w-0 flex-col items-center">
                            {/* Old look: white ring (border + white glow) + layered shadow
                            <span
                                className={`relative h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white sm:h-44 sm:w-44 max-sm:h-[5.5rem] max-sm:w-[5.5rem] max-sm:border-[3px] ${isDark(banner.theme)
                                    ? "shadow-[0_6px_14px_rgba(0,0,0,0.35),0_22px_48px_rgba(0,0,0,0.5),0_0_0_8px_rgba(255,255,255,0.06)]"
                                    : "shadow-[0_6px_14px_rgba(33,46,73,0.14),0_22px_48px_rgba(33,46,73,0.22),0_0_0_8px_rgba(255,255,255,0.7)]"
                                    }`}
                            > */}
                            {/* Round photo, no white ring: just the soft drop shadow */}
                            <span
                                className={`relative h-36 w-36 overflow-hidden rounded-full sm:h-44 sm:w-44 max-sm:h-[5.5rem] max-sm:w-[5.5rem] ${isDark(banner.theme)
                                    ? "shadow-[0_6px_14px_rgba(0,0,0,0.35),0_22px_48px_rgba(0,0,0,0.5)]"
                                    : "shadow-[0_6px_14px_rgba(33,46,73,0.14),0_22px_48px_rgba(33,46,73,0.22)]"
                                    }`}
                            >
                                {/* Zoomed a little so the circle edge trims the white frame
                                    some step photos have built in. */}
                                {item.image && <Image unoptimized={!canOptimizeImage(item.image)} src={item.image} alt="" fill sizes="200px" className="scale-[1.26] object-cover" />}
                            </span>
                            {/* Pill flips colours on navy so it stays visible */}
                            <span
                                className={`mt-6 rounded-full px-3 py-1 ${eyebrowClass} tracking-[0.16em] max-sm:mt-4 max-sm:px-2 max-sm:py-0.5 max-sm:text-[8px] ${isDark(banner.theme) ? "bg-white text-brand-navy" : "bg-brand-navy text-white"}`}
                            >
                                Step {index + 1}
                            </span>
                            {/* Cinzel step titles, matching the design */}
                            {item.title && <h3 className="mt-4 font-heading text-lg font-semibold leading-tight max-sm:mt-2 max-sm:text-sm">{item.title}</h3>}
                            {item.text && <p className={`mt-1.5 font-body text-xs ${theme.muted} max-sm:mt-1 max-sm:text-[11px] max-sm:leading-snug`}>{item.text}</p>}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

// Where the floating tags sit on the split image.
const TAG_POSITIONS = [
    "left-2 top-[12%] sm:left-0 sm:-translate-x-1/4",
    "bottom-[12%] right-2 sm:right-0 sm:translate-x-1/4",
    "right-2 top-1/2 sm:right-0 sm:translate-x-1/4",
];

/** 03 layout: text + points on the left, image with floating tags on the right. */
function SplitBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    return (
        <div className="pdp-container grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
                <BannerNumber value={banner.number} className={theme.number} />
                {banner.eyebrow && <p className={`${eyebrowClass} mt-4`}>{banner.eyebrow}</p>}
                <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
                {banner.body && <p className={`mt-4 whitespace-pre-line font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}
                {banner.items.length > 0 && (
                    <ul className={`mt-6 border-t ${theme.line}`}>
                        {banner.items.map((item, index) => (
                            <li key={index} className={`flex items-baseline gap-3 border-b py-3.5 font-body text-sm ${theme.line}`}>
                                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                <span>
                                    {item.title && <strong className="font-semibold">{item.title}</strong>}
                                    {item.title && item.text && " - "}
                                    {item.text && <span className={theme.muted}>{item.text}</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {banner.image && (
                <div className="relative mx-auto w-full max-w-sm">
                    {/* Image keeps its own shape (no fixed box), so nothing is cropped */}
                    <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                        <Image unoptimized={!canOptimizeImage(banner.image)} src={banner.image}
                            alt={banner.imageAlt || ""}
                            width={600}
                            height={1000}
                            sizes="(max-width: 1024px) 80vw, 384px"
                            className="block h-auto w-full"
                        />
                    </div>
                    {banner.tags.map((tag, index) => (
                        <span
                            key={index}
                            className={`absolute rounded-xl bg-white px-3.5 py-2 font-body text-xs font-semibold text-brand-navy shadow-lg ${TAG_POSITIONS[index] ?? ""}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/** 04 layout: full-width photo with the text over its left side (stacked on phones). */
function HeroBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);

    // Same text block for phones (above the photo) and desktop (on the photo).
    const text = (desktop: boolean) => (
        <>
            {banner.eyebrow && (
                <p className={`font-body font-semibold uppercase ${desktop ? "text-[clamp(9px,0.85cqw,12px)] tracking-[0.3em]" : "text-[10px] tracking-[0.24em]"}`}>
                    {banner.eyebrow}
                </p>
            )}
            <h2 className={`font-heading leading-[1.12] ${desktop ? "mt-[0.6em] text-[clamp(1.25rem,2.9cqw,2.6rem)]" : "mt-3 text-3xl sm:text-4xl"}`}>
                {banner.title}
            </h2>
            {banner.subtitle && (
                <p className={`flex items-center justify-center gap-3 font-body font-medium ${desktop ? "mt-[0.9em] text-[clamp(0.75rem,1.2cqw,1.05rem)]" : "mt-4 text-sm sm:text-base"}`}>
                    <span aria-hidden="true" className={`w-[2.2em] border-t ${theme.line} border-current opacity-50`} />
                    <span className="whitespace-pre-line">{banner.subtitle}</span>
                    <span aria-hidden="true" className={`w-[2.2em] border-t ${theme.line} border-current opacity-50`} />
                </p>
            )}
            {banner.body && (
                <p className={`whitespace-pre-line font-body leading-relaxed ${theme.muted} ${desktop ? "mt-[0.9em] text-[clamp(0.7rem,1cqw,0.95rem)]" : "mt-4 text-sm"}`}>
                    {banner.body}
                </p>
            )}
        </>
    );

    return (
        <div className="pdp-container">
            {/* Phones/tablets: text above the photo */}
            <div className="pb-6 text-center lg:hidden">{text(false)}</div>

            {banner.image ? (
                // A card inside the page width (not full screen). The photo keeps
                // its own shape; on desktop the text sits in its empty top-left
                // area and scales with the card (container units).
                <div className="@container relative overflow-hidden rounded-3xl shadow-[0_18px_40px_rgba(33,46,73,0.18)]">
                    <Image unoptimized={!canOptimizeImage(banner.image)} src={banner.image}
                        alt={banner.imageAlt || ""}
                        width={2140}
                        height={1200}
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        className="block h-auto w-full"
                    />
                    <div className="absolute left-[8%] top-[7%] hidden w-[40%] text-center lg:block">{text(true)}</div>
                </div>
            ) : (
                <div className="hidden text-center lg:block">{text(true)}</div>
            )}
        </div>
    );
}

/** Intro: centred label, title, short rule and text (e.g. "In the mood for closer?"). */
function IntroBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    const accent = accentOf(banner);
    return (
        <div className="pdp-container text-center">
            {banner.eyebrow && <p className={`${eyebrowClass} ${accent.text}`}>{banner.eyebrow} </p>}
            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-5xl">{banner.title}</h2>
            {/* <Divider className={accent.bg} /> */}
            {banner.subtitle && <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line font-body text-sm font-medium sm:text-base">{banner.subtitle}</p>}
            {banner.body && (
                <p className={`mx-auto mt-5 max-w-2xl whitespace-pre-line font-body text-sm leading-7 sm:text-base sm:leading-8 ${theme.muted}`}>
                    {banner.body}
                </p>
            )}
            <BannerCta banner={banner} className={isDark(banner.theme) ? "mt-8 bg-white text-brand-navy hover:bg-olympus" : "mt-8 bg-brand-navy text-white hover:bg-[#14284d]"} />
        </div>
    );
}

/** Features: heading on the left, then one row per feature with its picture on alternating sides. */
function FeaturesBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    const accent = accentOf(banner);
    return (
        <div className="pdp-container">
            {banner.eyebrow && <p className={`${eyebrowClass} ${accent.text}`}>{banner.eyebrow}</p>}
            <h2 className={`mt-2 font-heading text-4xl leading-tight sm:text-5xl ${accent.text}`}>{banner.title}</h2>
            {banner.subtitle && <p className="mt-2 whitespace-pre-line font-heading text-base uppercase tracking-[0.06em] sm:text-lg">{banner.subtitle}</p>}
            {banner.body && <p className={`mt-4 max-w-2xl whitespace-pre-line font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}

            {banner.items.length > 0 && (
                <ol className="mx-auto mt-10 max-w-4xl space-y-10 sm:mt-14 sm:space-y-14">
                    {banner.items.map((item, index) => {
                        const flip = index % 2 === 1;
                        return (
                            <li key={index} className={`flex items-center gap-4 sm:gap-6 ${flip ? "flex-row-reverse" : ""}`}>
                                <span className="relative flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f4f5f8] sm:h-40 sm:w-32">
                                    {item.image && (
                                        <Image unoptimized={!canOptimizeImage(item.image)} src={item.image} alt="" fill sizes="128px" className="object-contain p-2" />
                                    )}
                                </span>
                                {/* Connector: line ending in a dot, pointing at the text */}
                                <span aria-hidden="true" className={`hidden w-12 shrink-0 items-center sm:flex lg:w-20 ${flip ? "flex-row-reverse" : ""}`}>
                                    <span className={`h-2 w-2 rounded-full ${accent.bg}`} />
                                    <span className={`flex-1 border-t opacity-40 ${accent.border}`} />
                                    <span className={`h-1.5 w-1.5 rounded-full ${accent.bg} opacity-70`} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`${eyebrowClass} tracking-[0.18em] ${accent.text}`}>
                                        {String(index + 1).padStart(2, "0")}
                                        {item.label && ` · ${item.label}`}
                                    </p>
                                    {item.title && <h3 className="mt-1.5 font-heading text-lg leading-snug sm:text-2xl">{item.title}</h3>}
                                    {item.text && <p className={`mt-1.5 font-body text-xs leading-relaxed sm:text-sm ${theme.muted}`}>{item.text}</p>}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}

/** Showcase: centred label, title and text over a big photo (own phone photo optional), then a button. */
function ShowcaseBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    const accent = accentOf(banner);
    const navy = isDark(banner.theme);
    const photo = (src: string, className: string, mobile: boolean) => (
        <div className={`relative overflow-hidden rounded-3xl ${navy ? "shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10" : "shadow-[0_18px_40px_rgba(33,46,73,0.18)]"} ${className}`}>
            <Image unoptimized={!canOptimizeImage(src)} src={src}
                alt={banner.imageAlt || ""}
                width={mobile ? 800 : 1600}
                height={mobile ? 1000 : 900}
                sizes={mobile ? "100vw" : "(max-width: 1200px) 100vw, 1100px"}
                className="block h-auto w-full"
            />
        </div>
    );
    // Optional tilted tag in the banner's top corner, beside the heading
    // (admin: text + left / right), measured from the screen edge so it sits in
    // the empty space beside the 1200px content. Below 1280px wide there is no
    // room beside the title, so it is centred above the label instead.
    const tag = banner.tiltedTag?.trim();
    const tagLeft = banner.tiltedTagSide === "left";
    const hasAccent = Boolean(ACCENTS[banner.accent as keyof typeof ACCENTS]);
    const tagColours = hasAccent
        ? `${accent.bg} ${navy ? "text-brand-navy" : "text-white"}`
        : navy ? "bg-white text-brand-navy" : "bg-brand-navy text-white";
    const tiltedTag = tag ? (
        <span
            className={`pointer-events-none relative z-20 mb-5 inline-block max-w-[85%] rounded-md px-3 py-1.5 text-center font-body text-[10px] font-bold uppercase leading-snug tracking-[0.16em] shadow-[0_10px_24px_rgba(33,46,73,0.28)] ring-2 ring-white/70 sm:px-4 sm:py-2 sm:text-xs xl:absolute xl:top-16 xl:mb-0 xl:max-w-[13rem] 2xl:top-20 2xl:max-w-[18rem] ${tagColours} ${tagLeft ? "-rotate-6 xl:left-[calc((1200px_-_100vw)/2_+_2.5rem)]" : "rotate-6 xl:right-[calc((1200px_-_100vw)/2_+_2.5rem)]"}`}
        >
            {tag}
        </span>
    ) : null;
    return (
        <div className="pdp-container relative text-center">
            {tiltedTag}
            {banner.eyebrow && <p className={`${eyebrowClass} ${accent.text}`}>{banner.eyebrow}</p>}
            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
            {/* Short line under the title, removed: <Divider className={accent.bg} /> */}
            {banner.body && <p className={`mx-auto mt-5 max-w-2xl whitespace-pre-line font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}
            {/* Extra photos added: main photo + those slide every 2 seconds */}
            {banner.image && (banner.slides?.length ?? 0) > 0 ? (
                <div className="mx-auto mt-8 max-w-5xl sm:mt-10">
                    <ShowcaseSlider
                        slides={[{ image: banner.image, mobileImage: banner.mobileImage }, ...(banner.slides ?? [])]}
                        alt={banner.imageAlt || ""}
                        navy={navy}
                    />
                </div>
            ) : banner.image && (
                <div className="mx-auto mt-8 max-w-5xl sm:mt-10">
                    {banner.mobileImage ? (
                        <>
                            {photo(banner.mobileImage, "sm:hidden", true)}
                            {photo(banner.image, "hidden sm:block", false)}
                        </>
                    ) : (
                        photo(banner.image, "", false)
                    )}
                </div>
            )}
            <BannerCta banner={banner} className={navy ? "mt-8 bg-white text-brand-navy hover:bg-olympus" : "mt-8 bg-brand-navy text-white hover:bg-[#14284d]"} />
        </div>
    );
}

/** Cards: label + title on the left, short note on the right, then numbered cards (e.g. how-to steps). */
function CardsBanner({ banner }: { banner: StoryBanner }) {
    const theme = themeOf(banner);
    const accent = accentOf(banner);
    const navy = isDark(banner.theme);
    return (
        <div className="pdp-container">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                <div>
                    {banner.eyebrow && <p className={`${eyebrowClass} ${accent.text}`}>{banner.eyebrow}</p>}
                    <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
                </div>
                {banner.body && <p className={`max-w-sm whitespace-pre-line font-body text-sm leading-relaxed ${theme.muted}`}>{banner.body}</p>}
            </div>
            {banner.items.length > 0 && (
                <ol className={`mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 ${banner.items.length >= 4 ? "lg:grid-cols-4" : banner.items.length === 3 ? "lg:grid-cols-3" : ""}`}>
                    {banner.items.map((item, index) => (
                        <li key={index} className={`rounded-2xl border p-5 sm:p-6 ${navy ? "border-white/15 bg-white/[0.04]" : "border-[#e1e6ee] bg-white"}`}>
                            <p aria-hidden="true" className={`font-heading text-3xl font-normal leading-none ${accent.text || theme.number}`}>
                                {String(index + 1).padStart(2, "0")}
                            </p>
                            {item.title && <h3 className="mt-4 font-heading text-lg leading-snug">{item.title}</h3>}
                            {item.text && <p className={`mt-2 font-body text-xs leading-relaxed sm:text-sm ${theme.muted}`}>{item.text}</p>}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

const LAYOUT = {
    feature: FeatureBanner,
    steps: StepsBanner,
    split: SplitBanner,
    hero: HeroBanner,
    intro: IntroBanner,
    features: FeaturesBanner,
    showcase: ShowcaseBanner,
    cards: CardsBanner,
} as const;

/** Product-page story banners, stacked, with an optional heading above them. */
export default function ProductStoryBanners({ header, banners = [], pageTheme = "", pageAccent = "" }: ProductStoryBannersProps) {
    // A banner's own background / accent wins; "product" = use the page theme.
    const list = (banners ?? [])
        .filter((banner) => banner?.title?.trim())
        .map((banner) => ({
            ...banner,
            theme: banner.theme === "product" ? pageTheme || "light" : banner.theme,
            accent: banner.accent === "product" ? pageAccent : banner.accent,
        }));
    if (!list.length) return null;

    const hasHeader = Boolean(header && (header.eyebrow || header.title || header.subtitle));

    return (
        <div className="w-full">
            {list.map((banner, index) => {
                const Layout = LAYOUT[banner.layout as keyof typeof LAYOUT] ?? FeatureBanner;
                const theme = themeOf(banner);
                return (
                    <section
                        key={index}
                        aria-label={banner.title}
                        className={`w-full overflow-hidden py-12 ${theme.section} sm:py-16`}
                    >
                        {/* The heading sits inside the first banner, in its colours */}
                        {index === 0 && hasHeader && header && (
                            <div className="pdp-container mb-10 text-center sm:mb-12">
                                {header.eyebrow && <p className={eyebrowClass}>{header.eyebrow}</p>}
                                {header.title && <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{header.title}</h2>}
                                {header.subtitle && <p className={`mt-2 whitespace-pre-line font-body text-sm ${theme.muted}`}>{header.subtitle}</p>}
                            </div>
                        )}
                        <Layout banner={banner} />
                    </section>
                );
            })}
        </div>
    );
}
