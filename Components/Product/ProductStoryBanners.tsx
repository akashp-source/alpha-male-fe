import Image from "next/image";
import { canOptimizeImage } from "@/lib/image-hosts";

import type { Product } from "@/types/product";

type StoryBanner = NonNullable<Product["storyBanners"]>[number];

interface ProductStoryBannersProps {
    header?: Product["storyHeader"];
    banners?: Product["storyBanners"];
}

// Background + text colours per theme (brand tokens only).
const THEME = {
    light: { section: "bg-white text-brand-navy", muted: "text-brand-navy-muted", line: "border-olympus", number: "text-palladium" },
    pale: { section: "bg-pale-gray text-brand-navy", muted: "text-brand-navy-muted", line: "border-olympus", number: "text-medium-gray" },
    navy: { section: "bg-brand-navy text-white", muted: "text-olympus", line: "border-white/15", number: "text-white/35" },
} as const;

const themeOf = (banner: StoryBanner) => THEME[banner.theme as keyof typeof THEME] ?? THEME.light;

const eyebrowClass = "font-body text-[10px] font-semibold uppercase tracking-[0.22em]";

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
                {banner.eyebrow && <p className={`${eyebrowClass} mt-4`}>{banner.eyebrow}</p>}
                <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{banner.title}</h2>
                {banner.body && <p className={`mt-4 font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}
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
            {banner.body && <p className={`mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed ${theme.muted}`}>{banner.body}</p>}
            {banner.items.length > 0 && (
                // Phones: steps side by side with small photos (3 per row, 2 when there are 4),
                // so the banner stays short. Tablet/desktop unchanged.
                <ol className={`mt-12 grid gap-12 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-28 xl:gap-36 max-sm:mt-8 max-sm:gap-x-3 max-sm:gap-y-7 ${banner.items.length === 4 ? "max-sm:grid-cols-2" : "max-sm:grid-cols-3"}`}>
                    {banner.items.map((item, index) => (
                        <li key={index} className="flex min-w-0 flex-col items-center">
                            {/* Raised look: white ring + layered shadow (stronger on navy) */}
                            <span
                                className={`relative h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white sm:h-44 sm:w-44 max-sm:h-[5.5rem] max-sm:w-[5.5rem] max-sm:border-[3px] ${banner.theme === "navy"
                                    ? "shadow-[0_6px_14px_rgba(0,0,0,0.35),0_22px_48px_rgba(0,0,0,0.5),0_0_0_8px_rgba(255,255,255,0.06)]"
                                    : "shadow-[0_6px_14px_rgba(33,46,73,0.14),0_22px_48px_rgba(33,46,73,0.22),0_0_0_8px_rgba(255,255,255,0.7)]"
                                    }`}
                            >
                                {item.image && <Image unoptimized={!canOptimizeImage(item.image)} src={item.image} alt="" fill sizes="176px" className="object-cover" />}
                            </span>
                            {/* Pill flips colours on navy so it stays visible */}
                            <span
                                className={`mt-6 rounded-full px-3 py-1 ${eyebrowClass} tracking-[0.16em] max-sm:mt-4 max-sm:px-2 max-sm:py-0.5 max-sm:text-[8px] ${banner.theme === "navy" ? "bg-white text-brand-navy" : "bg-brand-navy text-white"}`}
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
                {banner.body && <p className={`mt-4 font-body text-sm leading-relaxed sm:text-base ${theme.muted}`}>{banner.body}</p>}
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
                    {banner.subtitle}
                    <span aria-hidden="true" className={`w-[2.2em] border-t ${theme.line} border-current opacity-50`} />
                </p>
            )}
            {banner.body && (
                <p className={`font-body leading-relaxed ${theme.muted} ${desktop ? "mt-[0.9em] text-[clamp(0.7rem,1cqw,0.95rem)]" : "mt-4 text-sm"}`}>
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

const LAYOUT = { feature: FeatureBanner, steps: StepsBanner, split: SplitBanner, hero: HeroBanner } as const;

/** Product-page story banners, stacked, with an optional heading above them. */
export default function ProductStoryBanners({ header, banners = [] }: ProductStoryBannersProps) {
    const list = (banners ?? []).filter((banner) => banner?.title?.trim());
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
                                {header.subtitle && <p className={`mt-2 font-body text-sm ${theme.muted}`}>{header.subtitle}</p>}
                            </div>
                        )}
                        <Layout banner={banner} />
                    </section>
                );
            })}
        </div>
    );
}
