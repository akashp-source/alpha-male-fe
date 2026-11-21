"use client";

// Shared with alphamale-admin-fe/Components/Campaign/SectionRenderer.tsx. Keep both copies in sync.

/* eslint-disable @next/next/no-img-element */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type CSSProperties,
    type FormEvent,
    type MouseEvent,
    type ReactNode,
} from "react";
import {
    PALETTE,
    inr,
    resolveData,
    resolveStyle,
    type CampaignProduct,
    type CampaignSection,
    type Device,
    type SectionStyle,
} from "./config";

type Products = Record<string, CampaignProduct>;

/**
 * What buttons do. The admin preview passes nothing (buttons are inert);
 * the customer website passes real cart / newsletter handlers.
 */
export type CampaignActions = {
    addToCart?: (productId: string, quantity: number) => Promise<void>;
    subscribe?: (email: string) => Promise<void>;
    productHref?: (product: CampaignProduct) => string;
};

const ActionsContext = createContext<CampaignActions>({});

export function CampaignActionsProvider({ value, children }: { value: CampaignActions; children: ReactNode }) {
    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
}

function useActions() {
    return useContext(ActionsContext);
}

type RenderProps = {
    data: Record<string, any>;
    style: SectionStyle;
    device: Device;
    products: Products;
};

// Use the storefront's next/font variables when present, else the Google Fonts names.
const SERIF = "var(--font-cinzel, Cinzel), Georgia, serif";
const SANS = "var(--font-montserrat, Montserrat), Arial, sans-serif";

/* ------------------------------------------------------------------ */
/* Outer section wrapper: height, spacing, background, width          */
/* ------------------------------------------------------------------ */

export function SectionRenderer({
    section,
    device,
    products,
}: {
    section: CampaignSection;
    device: Device;
    products: Products;
}) {
    const style = resolveStyle(section);
    const data = resolveData(section);
    const mobile = device === "mobile";

    const height = mobile ? style.mobileHeight || style.height : style.height;
    const bgImage = (mobile && style.mobileBackgroundImage) || style.backgroundImage;

    const outer: CSSProperties = {
        position: "relative",
        boxSizing: "border-box",
        overflow: style.heightMode === "fixed" ? "hidden" : undefined,
        background: style.background || "transparent",
        color: style.textColor,
        paddingTop: mobile ? style.mobilePaddingTop : style.paddingTop,
        paddingBottom: mobile ? style.mobilePaddingBottom : style.paddingBottom,
        paddingLeft: mobile ? style.mobilePaddingX : style.paddingX,
        paddingRight: mobile ? style.mobilePaddingX : style.paddingX,
        marginTop: mobile ? style.mobileMarginTop : style.marginTop,
        borderRadius: style.borderRadius || undefined,
        display: "flex",
        flexDirection: "column",
        justifyContent:
            style.verticalAlign === "top"
                ? "flex-start"
                : style.verticalAlign === "bottom"
                    ? "flex-end"
                    : "center",
        textAlign: style.align,
        fontFamily: SANS,
    };

    if (style.heightMode === "fixed") outer.height = height;
    if (style.heightMode === "min") outer.minHeight = height;
    if (style.heightMode === "screen") outer.minHeight = mobile ? 844 : "100vh";

    if (bgImage) {
        outer.backgroundImage = `url("${bgImage}")`;
        outer.backgroundSize = style.backgroundSize;
        outer.backgroundPosition = style.backgroundPosition || "center";
        outer.backgroundRepeat = "no-repeat";
    }

    const maxWidth =
        style.contentWidth === "narrow"
            ? 860
            : style.contentWidth === "wide"
                ? 1440
                : style.contentWidth === "full"
                    ? "none"
                    : 1240;

    const props: RenderProps = { data, style, device, products };

    return (
        <section id={style.anchorId || undefined} style={outer}>
            {style.overlayOpacity > 0 && (
                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: style.overlayColor,
                        opacity: style.overlayOpacity / 100,
                        pointerEvents: "none",
                    }}
                />
            )}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth,
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                {renderBody(section.type, props)}
            </div>
        </section>
    );
}

function renderBody(type: CampaignSection["type"], props: RenderProps) {
    switch (type) {
        case "hero":
            return <Hero {...props} />;
        case "promo_banner":
            return <PromoBanner {...props} />;
        case "countdown":
            return <CountdownSection {...props} />;
        case "product_grid":
            return <ProductGrid {...props} />;
        case "product_carousel":
            return <ProductCarousel {...props} />;
        case "bundle_offers":
            return <BundleOffers {...props} />;
        case "comparison_table":
            return <ComparisonTable {...props} />;
        case "image_text":
            return <ImageText {...props} />;
        case "benefits":
            return <Benefits {...props} />;
        case "category_collection":
            return <ImageTiles {...props} />;
        case "rich_text":
            return <RichText {...props} />;
        case "video":
            return <Video {...props} />;
        case "testimonials":
            return <Testimonials {...props} />;
        case "faq":
            return <Faq {...props} />;
        case "newsletter":
            return <Newsletter {...props} />;
        default:
            return null;
    }
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function headingStyle(style: SectionStyle, device: Device, scale = 1): CSSProperties {
    const size = (device === "mobile" ? style.mobileHeadingSize : style.headingSize) * scale;
    return {
        margin: 0,
        fontFamily: style.headingFont === "serif" ? SERIF : SANS,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.12,
        whiteSpace: "pre-line",
        color: "inherit",
    };
}

function alignItems(style: SectionStyle) {
    return style.align === "center" ? "center" : style.align === "right" ? "flex-end" : "flex-start";
}

function Eyebrow({ text, color, pill }: { text?: string; color: string; pill?: { bg: string; fg: string } }) {
    if (!text) return null;
    if (pill) {
        return (
            <span
                style={{
                    width: "fit-content",
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: pill.bg,
                    color: pill.fg,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                }}
            >
                {text}
            </span>
        );
    }
    return (
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", color }}>{text}</span>
    );
}

function SectionHeader({
    data,
    style,
    device,
    marginBottom = 32,
}: RenderProps & { marginBottom?: number }) {
    if (!data.eyebrow && !data.heading && !data.subheading) return null;
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: alignItems(style),
                gap: 10,
                marginBottom,
            }}
        >
            <Eyebrow text={data.eyebrow} color={style.accentColor} />
            {data.heading && <h2 style={headingStyle(style, device)}>{data.heading}</h2>}
            {data.subheading && (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: style.mutedColor, maxWidth: 640, whiteSpace: "pre-line" }}>
                    {data.subheading}
                </p>
            )}
        </div>
    );
}

function Button({
    text,
    href,
    style,
    variant = "solid",
    full,
    device,
    action,
}: {
    text?: string;
    href?: string;
    style: SectionStyle;
    variant?: "solid" | "outline";
    full?: boolean;
    device: Device;
    action?: () => Promise<void>;
}) {
    if (!text) return null;
    const css: CSSProperties = {
        height: device === "mobile" ? 50 : 56,
        padding: "0 28px",
        boxSizing: "border-box",
        borderRadius: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        fontSize: device === "mobile" ? 15 : 16,
        fontWeight: 700,
        width: full ? "100%" : undefined,
        cursor: "pointer",
        ...(variant === "solid"
            ? { background: style.buttonColor, color: style.buttonTextColor, border: "none" }
            : { background: "transparent", color: "inherit", border: "1.5px solid currentColor", opacity: 0.9 }),
    };
    if (!href && action) {
        return <ActionButton label={text} action={action} style={css} />;
    }
    return (
        <a href={href || "#"} style={css}>
            {text}
        </a>
    );
}

/** A button that runs an async action (e.g. add to cart) with feedback. */
function ActionButton({ label, action, style }: { label: string; action: () => Promise<void>; style: CSSProperties }) {
    const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
    const [message, setMessage] = useState("");

    async function run(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (state === "busy") return;
        setState("busy");
        setMessage("");
        try {
            await action();
            setState("done");
            setTimeout(() => setState("idle"), 1800);
        } catch (err) {
            setState("error");
            setMessage(err instanceof Error ? err.message : "Something went wrong");
        }
    }

    return (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, width: style.width, marginTop: style.marginTop }}>
            <button type="button" onClick={run} disabled={state === "busy"} style={{ ...style, marginTop: 0, fontFamily: "inherit", opacity: state === "busy" ? 0.7 : 1 }}>
                {state === "busy" ? "Adding…" : state === "done" ? "Added to cart ✓" : label}
            </button>
            {state === "error" && message && <span style={{ fontSize: 12, color: "#d64545" }}>{message}</span>}
        </span>
    );
}

function Grid({
    columns,
    mobileColumns,
    device,
    gap = 16,
    children,
}: {
    columns: number;
    mobileColumns: number;
    device: Device;
    gap?: number;
    children: ReactNode;
}) {
    const cols = Math.max(1, Number(device === "mobile" ? mobileColumns : columns) || 1);
    return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
            {children}
        </div>
    );
}

function CheckIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
    );
}

function Placeholder({ label, height = 160, dark }: { label: string; height?: number | string; dark?: boolean }) {
    return (
        <div
            style={{
                height,
                width: "100%",
                borderRadius: 16,
                border: `2px dashed ${dark ? "rgba(255,255,255,0.3)" : "#d8d0c4"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: dark ? "rgba(255,255,255,0.6)" : "#8a7f74",
                textAlign: "center",
                padding: 12,
                boxSizing: "border-box",
            }}
        >
            {label}
        </div>
    );
}

function cardStyle(data: Record<string, any>): CSSProperties {
    return {
        background: data.cardBackground || "transparent",
        color: data.cardTextColor || "inherit",
        borderRadius: Number(data.cardRadius ?? 18),
        border: data.cardBackground && data.cardBackground !== "transparent" ? `1px solid ${PALETTE.border}` : "none",
        boxSizing: "border-box",
    };
}

/* ------------------------------------------------------------------ */
/* Countdown                                                           */
/* ------------------------------------------------------------------ */

// `now` starts empty and only ticks in the browser, so the server-rendered
// and client-rendered HTML always match (shows "--" until the first tick).
function useTimeLeft(endsAt?: string) {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        const tick = () => setNow(Date.now());
        const first = setTimeout(tick, 0);
        const timer = setInterval(tick, 1000);
        return () => {
            clearTimeout(first);
            clearInterval(timer);
        };
    }, []);
    const end = endsAt ? new Date(endsAt).getTime() : NaN;
    if (Number.isNaN(end)) return null;
    if (now === null) return undefined;
    return Math.max(0, Math.floor((end - now) / 1000));
}

function CountdownBoxes({ endsAt, device, expiredText }: { endsAt?: string; device: Device; expiredText?: string }) {
    const left = useTimeLeft(endsAt);
    if (left === null) return <span style={{ fontSize: 13, opacity: 0.7 }}>Set an end date for the countdown</span>;
    if (left === 0 && expiredText) return <span style={{ fontSize: 15, fontWeight: 600 }}>{expiredText}</span>;
    const pad = (n: number) => (left === undefined ? "--" : String(n).padStart(2, "0"));
    const l = left ?? 0;
    const parts = [
        { value: pad(Math.floor(l / 86400)), label: "DAYS" },
        { value: pad(Math.floor((l % 86400) / 3600)), label: "HRS" },
        { value: pad(Math.floor((l % 3600) / 60)), label: "MIN" },
        { value: pad(l % 60), label: "SEC" },
    ];
    const size = device === "mobile" ? 64 : 72;
    return (
        <div role="timer" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {parts.map((part) => (
                <span
                    key={part.label}
                    style={{
                        width: size,
                        padding: "10px 0",
                        borderRadius: 14,
                        background: "color-mix(in srgb, currentColor 8%, transparent)",
                        border: "1px solid color-mix(in srgb, currentColor 16%, transparent)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <span style={{ fontSize: device === "mobile" ? 22 : 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {part.value}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", opacity: 0.75 }}>{part.label}</span>
                </span>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ data, style, device, products }: RenderProps) {
    const mobile = device === "mobile";
    const product = products[data.productId];
    const actions = useActions();
    const addToCart = actions.addToCart;
    const addProduct = product && addToCart ? () => addToCart(product._id, 1) : undefined;
    const price = numberOr(data.price, product?.price);
    const compare = numberOr(data.compareAtPrice, product?.compareAtPrice ?? undefined);
    const image = data.productImage || product?.images?.[0] || "";
    const layout: string = data.layout || "split-right";
    const centered = layout === "centered" || style.align === "center";
    const imageSize = Number(mobile ? data.mobileImageHeight : data.imageHeight) || (mobile ? 300 : 440);

    const text = (
        <div
            style={{
                flex: "1 1 460px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: centered ? "center" : alignItems(style),
                textAlign: centered ? "center" : style.align,
                gap: 22,
            }}
        >
            <Eyebrow text={data.eyebrow} color={style.accentColor} pill={{ bg: style.accentColor, fg: PALETTE.dark }} />
            {data.heading && <h1 style={headingStyle(style, device)}>{data.heading}</h1>}
            {data.subheading && (
                <p style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.65, color: style.mutedColor, whiteSpace: "pre-line" }}>
                    {data.subheading}
                </p>
            )}
            {data.showPrice && price !== undefined && price > 0 && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", justifyContent: centered ? "center" : undefined }}>
                    <span style={{ fontSize: mobile ? 36 : 44, fontWeight: 700, lineHeight: 1 }}>{inr(price)}</span>
                    {compare !== undefined && compare > price && (
                        <>
                            <span style={{ fontSize: 20, opacity: 0.6, textDecoration: "line-through" }}>{inr(compare)}</span>
                            <span style={{ padding: "6px 12px", borderRadius: 999, background: PALETTE.green, color: "#fff", fontSize: 13, fontWeight: 700 }}>
                                Save {inr(compare - price)}
                            </span>
                        </>
                    )}
                </div>
            )}
            {data.showCountdown && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: centered ? "center" : undefined }}>
                    {data.countdownLabel && (
                        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: style.accentColor }}>
                            {data.countdownLabel}
                        </span>
                    )}
                    <CountdownBoxes endsAt={data.countdownEndsAt} device={device} />
                </div>
            )}
            {(data.primaryButtonText || data.secondaryButtonText) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: centered ? "center" : undefined }}>
                    <Button text={data.primaryButtonText} href={data.primaryButtonLink} style={style} device={device} action={addProduct} />
                    <Button text={data.secondaryButtonText} href={data.secondaryButtonLink} style={style} device={device} variant="outline" />
                </div>
            )}
        </div>
    );

    const art =
        layout === "text-only" ? null : (
            <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", justifyContent: "center" }}>
                <div
                    style={{
                        position: "relative",
                        width: imageSize,
                        height: imageSize,
                        maxWidth: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {data.showImageCircle && (
                        <span
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 999,
                                background: "color-mix(in srgb, currentColor 7%, transparent)",
                                boxShadow: `0 0 0 18px color-mix(in srgb, ${style.accentColor} 8%, transparent), 0 0 0 40px color-mix(in srgb, ${style.accentColor} 4%, transparent)`,
                            }}
                        />
                    )}
                    {image ? (
                        <img
                            src={image}
                            alt={product?.name || ""}
                            style={{
                                position: "relative",
                                maxHeight: "82%",
                                maxWidth: "90%",
                                objectFit: "contain",
                                borderRadius: 14,
                                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
                                transform: `rotate(${Number(data.imageRotate) || 0}deg)`,
                            }}
                        />
                    ) : (
                        <Placeholder label="Pick a product or upload a hero image" height="70%" dark={isDark(style.background)} />
                    )}
                    {data.badgeText && (
                        <span
                            style={{
                                position: "absolute",
                                top: "6%",
                                right: 0,
                                width: mobile ? 80 : 96,
                                height: mobile ? 80 : 96,
                                borderRadius: 999,
                                background: style.accentColor,
                                color: PALETTE.dark,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                transform: "rotate(10deg)",
                                boxShadow: "0 12px 24px -10px rgba(0,0,0,0.5)",
                            }}
                        >
                            <span style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, lineHeight: 1 }}>{data.badgeText}</span>
                            {data.badgeSubtext && (
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>{data.badgeSubtext}</span>
                            )}
                        </span>
                    )}
                    {data.chipText && (
                        <span
                            style={{
                                position: "absolute",
                                bottom: "10%",
                                left: "-4%",
                                padding: "10px 14px",
                                borderRadius: 14,
                                background: "#fff",
                                color: PALETTE.navy,
                                fontSize: 13,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                boxShadow: "0 12px 24px -12px rgba(0,0,0,0.5)",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PALETTE.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                            </svg>
                            {data.chipText}
                        </span>
                    )}
                </div>
            </div>
        );

    const stacked = layout === "centered";
    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: stacked ? "column" : layout === "split-left" ? "row-reverse" : "row",
                alignItems: "center",
                gap: mobile ? 28 : 48,
            }}
        >
            {text}
            {art}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Promo banner                                                        */
/* ------------------------------------------------------------------ */

function PromoBanner({ data, style, device }: RenderProps) {
    const mobile = device === "mobile";
    const hasCard = data.cardBackground && data.cardBackground !== "transparent";
    const centered = data.layout === "centered";

    const wrapper: CSSProperties = {
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexWrap: "wrap",
        flexDirection: centered ? "column" : "row",
        alignItems: "center",
        justifyContent: centered ? "center" : "space-between",
        textAlign: centered ? "center" : style.align,
        gap: 20,
        padding: hasCard ? (mobile ? 22 : 32) : 0,
        boxSizing: "border-box",
        background: hasCard ? data.cardBackground : undefined,
        color: hasCard ? data.cardTextColor || "inherit" : "inherit",
        borderRadius: hasCard ? Number(data.cardRadius ?? 28) : 0,
    };

    return (
        <div style={wrapper}>
            {hasCard && (
                <span
                    aria-hidden="true"
                    style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: 999, border: "2px solid currentColor", opacity: 0.1 }}
                />
            )}
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: centered ? "column" : "row",
                    alignItems: "center",
                    gap: 18,
                    flex: centered ? undefined : "1 1 360px",
                    minWidth: 0,
                }}
            >
                {data.iconText && (
                    <span
                        aria-hidden="true"
                        style={{
                            width: 64,
                            height: 64,
                            flexShrink: 0,
                            borderRadius: 999,
                            background: PALETTE.dark,
                            color: PALETTE.gold,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            fontWeight: 700,
                        }}
                    >
                        {data.iconText}
                    </span>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: centered ? "center" : "left" }}>
                    {data.eyebrow && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em" }}>{data.eyebrow}</span>}
                    {data.heading && <h2 style={headingStyle(style, device, 0.72)}>{data.heading}</h2>}
                    {data.subheading && <p style={{ margin: 0, fontSize: 14, opacity: 0.85, whiteSpace: "pre-line" }}>{data.subheading}</p>}
                </div>
            </div>
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                {(data.highlightLabel || data.highlightValue) && (
                    <p style={{ margin: 0, padding: "12px 18px", borderRadius: 14, background: "color-mix(in srgb, currentColor 8%, transparent)", fontSize: 14, fontWeight: 600 }}>
                        {data.highlightLabel} <strong style={{ fontSize: 18 }}>{data.highlightValue}</strong>
                    </p>
                )}
                <Button text={data.buttonText} href={data.buttonLink} style={style} device={device} />
                {data.image && (
                    <img src={data.image} alt="" style={{ height: mobile ? 120 : 160, width: "auto", borderRadius: 16, objectFit: "cover" }} />
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Countdown section                                                   */
/* ------------------------------------------------------------------ */

function CountdownSection(props: RenderProps) {
    const { data, style, device } = props;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: alignItems(style), gap: 22 }}>
            <SectionHeader {...props} marginBottom={0} />
            <CountdownBoxes endsAt={data.endsAt} device={device} expiredText={data.expiredText} />
            <Button text={data.buttonText} href={data.buttonLink} style={style} device={device} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function ProductCard({ product, data, style, device }: { product: CampaignProduct; data: Record<string, any>; style: SectionStyle; device: Device }) {
    const compare = Number(product.compareAtPrice) || 0;
    const actions = useActions();
    const addToCart = actions.addToCart;
    const href = actions.productHref?.(product);
    const buttonCss: CSSProperties = {
        marginTop: "auto",
        width: "100%",
        height: 44,
        border: "none",
        borderRadius: 12,
        background: style.buttonColor,
        color: style.buttonTextColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
    };
    return (
        <div style={{ ...cardStyle(data), padding: 14, display: "flex", flexDirection: "column", gap: 10, textAlign: "left", height: "100%" }}>
            <a href={href || "#"} style={{ display: "flex", flexDirection: "column", gap: 10, color: "inherit", textDecoration: "none" }}>
            <div
                style={{
                    height: Number(data.imageHeight) || 220,
                    borderRadius: Math.max(0, Number(data.cardRadius ?? 18) - 6),
                    background: "#f3eee6",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: data.imageFit || "contain" }} />
                ) : (
                    <span style={{ fontSize: 12, color: "#8a7f74" }}>No image</span>
                )}
            </div>
            <span style={{ fontSize: device === "mobile" ? 14 : 15, fontWeight: 700 }}>{product.name}</span>
            </a>
            {data.showPrice && (
                <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{inr(product.price)}</span>
                    {data.showCompareAt && compare > product.price && (
                        <span style={{ fontSize: 13, opacity: 0.55, textDecoration: "line-through" }}>{inr(compare)}</span>
                    )}
                </span>
            )}
            {data.showAddToCart && data.buttonText && (
                addToCart ? (
                    <ActionButton label={data.buttonText} action={() => addToCart(product._id, 1)} style={buttonCss} />
                ) : (
                    <span style={buttonCss}>{data.buttonText}</span>
                )
            )}
        </div>
    );
}

function pickProducts(ids: any, products: Products) {
    return (Array.isArray(ids) ? ids : []).map((id: string) => products[id]).filter(Boolean) as CampaignProduct[];
}

function ProductGrid(props: RenderProps) {
    const { data, device, products } = props;
    const list = pickProducts(data.productIds, products);
    return (
        <>
            <SectionHeader {...props} />
            {list.length === 0 ? (
                <Placeholder label="Choose products for this grid in the settings panel" />
            ) : (
                <Grid columns={data.columns} mobileColumns={data.mobileColumns} device={device}>
                    {list.map((product) => (
                        <ProductCard key={product._id} product={product} {...props} />
                    ))}
                </Grid>
            )}
        </>
    );
}

function ProductCarousel(props: RenderProps) {
    const { data, products } = props;
    const list = pickProducts(data.productIds, products);
    return (
        <>
            <SectionHeader {...props} />
            {list.length === 0 ? (
                <Placeholder label="Choose products for this carousel in the settings panel" />
            ) : (
                <div style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8 }}>
                    {list.map((product) => (
                        <div key={product._id} style={{ flex: `0 0 ${Number(data.cardWidth) || 260}px`, scrollSnapAlign: "start" }}>
                            <ProductCard product={product} {...props} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function BundleOffers(props: RenderProps) {
    const { data, style, device, products } = props;
    const product = products[data.productId];
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    const initial = items.find((item) => item.highlighted)?._key ?? items[0]?._key;
    const [selected, setSelected] = useState<string | undefined>(initial);
    const current = items.some((item) => item._key === selected) ? selected : initial;
    const packHeight = Number(data.packImageHeight) || 130;
    const addToCart = useActions().addToCart;
    const packButtonCss: CSSProperties = {
        marginTop: "auto",
        width: "100%",
        height: 52,
        border: "none",
        borderRadius: 14,
        background: PALETTE.dark,
        color: PALETTE.gold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
    };

    return (
        <>
            <SectionHeader {...props} />
            {items.length === 0 ? (
                <Placeholder label="Add packs in the settings panel" dark={isDark(style.background)} />
            ) : (
                <Grid columns={data.columns} mobileColumns={data.mobileColumns} device={device} gap={18}>
                    {items.map((item) => {
                        const on = item._key === current;
                        const qty = Math.max(1, Number(item.quantity) || 1);
                        const price = Number(item.price) || 0;
                        const mrp = Number(item.compareAtPrice) || 0;
                        const packImage = item.image || product?.images?.[0];
                        return (
                            <label
                                key={item._key}
                                onClick={() => setSelected(item._key)}
                                style={{
                                    ...cardStyle(data),
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                    padding: "26px 22px 22px",
                                    marginTop: item.ribbon ? 12 : 0,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    border: on ? `3px solid ${PALETTE.gold}` : "3px solid transparent",
                                    boxShadow: on ? "0 0 0 6px rgba(231,196,156,0.2)" : "none",
                                }}
                            >
                                {item.ribbon && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            padding: "7px 16px",
                                            borderRadius: 999,
                                            background: PALETTE.gold,
                                            color: PALETTE.dark,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            letterSpacing: "0.14em",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.ribbon}
                                    </span>
                                )}
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                    <span style={{ fontSize: 18, fontWeight: 700 }}>{item.title}</span>
                                    <input type="radio" readOnly checked={on} style={{ accentColor: PALETTE.green, width: 22, height: 22, margin: 0 }} />
                                </span>
                                <span style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: packHeight + 20 }}>
                                    {packImage ? (
                                        item.image ? (
                                            <img src={packImage} alt="" style={{ height: packHeight, width: "auto", maxWidth: "100%", objectFit: "contain", borderRadius: 8 }} />
                                        ) : (
                                            Array.from({ length: Math.min(qty, 5) }).map((_, i, all) => (
                                                <img
                                                    key={i}
                                                    src={packImage}
                                                    alt=""
                                                    style={{
                                                        height: packHeight,
                                                        width: "auto",
                                                        borderRadius: 8,
                                                        boxShadow: "0 14px 24px -12px rgba(0,0,0,0.5)",
                                                        marginLeft: i ? -38 : 0,
                                                        transform: `rotate(${(i - (all.length - 1) / 2) * 7}deg)`,
                                                        position: "relative",
                                                        zIndex: i,
                                                    }}
                                                />
                                            ))
                                        )
                                    ) : (
                                        <Placeholder label="Pack image" height={packHeight} />
                                    )}
                                </span>
                                <span style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 30, fontWeight: 700 }}>{inr(price)}</span>
                                    {mrp > price && <span style={{ fontSize: 15, opacity: 0.55, textDecoration: "line-through" }}>{inr(mrp)}</span>}
                                </span>
                                {item.description && <span style={{ fontSize: 13, opacity: 0.75 }}>{item.description}</span>}
                                <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {data.showSavings && mrp > price && (
                                        <span style={{ padding: "5px 10px", borderRadius: 999, background: "#e9f2ed", color: PALETTE.green, fontSize: 12, fontWeight: 700 }}>
                                            Save {inr(mrp - price)}
                                        </span>
                                    )}
                                    {data.showPerUnit && qty > 1 && (
                                        <span style={{ padding: "5px 10px", borderRadius: 999, background: "#f3eee6", color: PALETTE.body, fontSize: 12, fontWeight: 600 }}>
                                            {inr(price / qty)} per pack
                                        </span>
                                    )}
                                </span>
                                {item.buttonText &&
                                    (product && addToCart ? (
                                        <ActionButton label={item.buttonText} action={() => addToCart(product._id, qty)} style={packButtonCss} />
                                    ) : (
                                        <span style={packButtonCss}>{item.buttonText}</span>
                                    ))}
                            </label>
                        );
                    })}
                </Grid>
            )}
        </>
    );
}

function ComparisonTable(props: RenderProps) {
    const { data, products } = props;
    const columnProducts = pickProducts(data.productIds, products);
    const custom = String(data.customColumns || "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    const columns = columnProducts.length
        ? columnProducts.map((p) => ({ label: p.name, image: p.images?.[0] }))
        : custom.map((label) => ({ label, image: undefined as string | undefined }));
    const rows: any[] = Array.isArray(data.rows) ? data.rows : [];
    const highlight = Number(data.highlightColumn) || 0;

    const cell = (value: string) => {
        const v = value.trim().toLowerCase();
        if (["yes", "y", "true", "✓"].includes(v))
            return <span style={{ color: PALETTE.green, display: "inline-flex" }}><CheckIcon size={20} /></span>;
        if (["no", "n", "false", "✗", "x", "-"].includes(v)) return <span style={{ opacity: 0.4 }}>—</span>;
        return value;
    };

    return (
        <>
            <SectionHeader {...props} />
            {columns.length === 0 || rows.length === 0 ? (
                <Placeholder label="Pick products or type custom columns, then add rows" />
            ) : (
                <div style={{ ...cardStyle(data), overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "center" }}>
                        <thead>
                            <tr>
                                <th style={{ padding: 16 }} />
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        style={{
                                            padding: 16,
                                            fontWeight: 700,
                                            background: highlight === i + 1 ? "rgba(231,196,156,0.35)" : undefined,
                                            minWidth: 110,
                                        }}
                                    >
                                        {col.image && <img src={col.image} alt="" style={{ height: 64, width: "auto", display: "block", margin: "0 auto 8px", objectFit: "contain" }} />}
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const values = String(row.values || "").split("|");
                                return (
                                    <tr key={row._key} style={{ borderTop: `1px solid ${PALETTE.border}` }}>
                                        <td style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600 }}>{row.label}</td>
                                        {columns.map((_, i) => (
                                            <td key={i} style={{ padding: "14px 16px", background: highlight === i + 1 ? "rgba(231,196,156,0.2)" : undefined }}>
                                                {cell(values[i] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

function ImageText({ data, style, device }: RenderProps) {
    const mobile = device === "mobile";
    const gallery = [
        ...(data.image ? [{ image: data.image, alt: "" }] : []),
        ...((Array.isArray(data.gallery) ? data.gallery : []).filter((g: any) => g.image) as { image: string; alt: string }[]),
    ];
    const [active, setActive] = useState(0);
    const current = gallery[Math.min(active, gallery.length - 1)];
    const width = Math.min(75, Math.max(25, Number(data.imageWidth) || 50));
    const bullets: any[] = Array.isArray(data.bullets) ? data.bullets : [];
    const radius = Number(data.imageRadius ?? 24);

    const media = (
        <div style={{ flex: mobile ? "1 1 100%" : `0 0 calc(${width}% - 20px)`, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {current ? (
                <div style={{ aspectRatio: data.imageAspect === "auto" ? undefined : data.imageAspect, borderRadius: radius, overflow: "hidden", background: PALETTE.navy }}>
                    <img src={current.image} alt={current.alt || ""} style={{ width: "100%", height: "100%", objectFit: data.imageFit || "cover", display: "block" }} />
                </div>
            ) : (
                <Placeholder label="Upload an image" height={260} />
            )}
            {gallery.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(5, gallery.length)}, minmax(0, 1fr))`, gap: 10 }}>
                    {gallery.map((g, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActive(i);
                            }}
                            style={{
                                padding: 0,
                                aspectRatio: "16 / 10",
                                borderRadius: 12,
                                overflow: "hidden",
                                cursor: "pointer",
                                background: PALETTE.navy,
                                border: i === active ? `3px solid ${PALETTE.navy}` : "3px solid transparent",
                                opacity: i === active ? 1 : 0.7,
                            }}
                        >
                            <img src={g.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const content = (
        <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: alignItems(style), gap: 20 }}>
            <Eyebrow text={data.eyebrow} color={style.accentColor} />
            {data.heading && <h2 style={headingStyle(style, device)}>{data.heading}</h2>}
            {data.description && (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: style.mutedColor, whiteSpace: "pre-line" }}>{data.description}</p>
            )}
            {bullets.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: `repeat(${mobile ? 1 : Math.max(1, Number(data.bulletColumns) || 2)}, minmax(0, 1fr))`,
                        gap: 12,
                    }}
                >
                    {bullets.map((b) => (
                        <li key={b._key} style={{ display: "flex", gap: 12, padding: 16, borderRadius: 16, background: "#fff", border: `1px solid ${PALETTE.border}`, color: PALETTE.navy, textAlign: "left" }}>
                            <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 999, background: "#e9f2ed", color: PALETTE.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckIcon />
                            </span>
                            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{b.title}</span>
                                {b.text && <span style={{ fontSize: 13, lineHeight: 1.5, color: PALETTE.muted }}>{b.text}</span>}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <Button text={data.buttonText} href={data.buttonLink} style={style} device={device} />
        </div>
    );

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 40,
                alignItems: "flex-start",
                flexDirection: !mobile && data.imagePosition === "right" ? "row-reverse" : "row",
            }}
        >
            {media}
            {content}
        </div>
    );
}

function Benefits(props: RenderProps) {
    const { data, style, device } = props;
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    const layout = data.layout || "cards";
    const imageSize = Number(data.imageSize) || 64;

    const card = (item: any, index: number) => {
        if (layout === "strip") {
            return (
                <div
                    key={item._key}
                    style={{
                        ...cardStyle(data),
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "18px 20px",
                        boxShadow: "0 16px 32px -24px rgba(7,22,47,0.4)",
                        textAlign: "left",
                    }}
                >
                    <span style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 999, background: PALETTE.navy, color: PALETTE.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, overflow: "hidden" }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.badge || <CheckIcon size={20} />}
                    </span>
                    <span>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>{item.title}</span>
                        {item.text && <span style={{ fontSize: 13, opacity: 0.7 }}>{item.text}</span>}
                    </span>
                </div>
            );
        }
        if (layout === "steps") {
            return (
                <div key={item._key} style={{ ...cardStyle(data), display: "flex", flexDirection: "column", gap: 12, padding: 20, textAlign: "left" }}>
                    {item.image && <img src={item.image} alt="" style={{ width: "100%", height: imageSize * 2, objectFit: "cover", borderRadius: 12 }} />}
                    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: PALETTE.gold, lineHeight: 1 }}>
                        {item.badge || String(index + 1).padStart(2, "0")}
                    </span>
                    {item.title && <span style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</span>}
                    {item.text && <span style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{item.text}</span>}
                </div>
            );
        }
        if (layout === "icons") {
            return (
                <div key={item._key} style={{ ...cardStyle(data), display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, padding: 22 }}>
                    {item.image ? (
                        <img src={item.image} alt="" style={{ width: imageSize, height: imageSize, objectFit: "contain" }} />
                    ) : (
                        <span style={{ width: imageSize, height: imageSize, borderRadius: 999, background: "#e9f2ed", color: PALETTE.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: imageSize / 3 }}>
                            {item.badge || <CheckIcon size={imageSize / 2.4} />}
                        </span>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</span>
                    {item.text && <span style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.75 }}>{item.text}</span>}
                </div>
            );
        }
        return (
            <div key={item._key} style={{ ...cardStyle(data), display: "flex", gap: 12, padding: 16, textAlign: "left" }}>
                <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 999, background: "#e9f2ed", color: PALETTE.green, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 12, fontWeight: 700 }}>
                    {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.badge || <CheckIcon />}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</span>
                    {item.text && <span style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.75 }}>{item.text}</span>}
                </span>
            </div>
        );
    };

    return (
        <>
            <SectionHeader {...props} marginBottom={28} />
            {items.length === 0 ? (
                <Placeholder label="Add items in the settings panel" dark={isDark(style.background)} />
            ) : (
                <Grid columns={data.columns} mobileColumns={data.mobileColumns} device={device} gap={14}>
                    {items.map(card)}
                </Grid>
            )}
        </>
    );
}

function ImageTiles(props: RenderProps) {
    const { data, device } = props;
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    const radius = Number(data.tileRadius ?? 24);
    const position = data.titlePosition || "none";

    return (
        <>
            <SectionHeader {...props} />
            {items.length === 0 ? (
                <Placeholder label="Add image tiles in the settings panel" />
            ) : (
                <Grid columns={data.columns} mobileColumns={data.mobileColumns} device={device}>
                    {items.map((item) => {
                        const src = (device === "mobile" && item.mobileImage) || item.image;
                        return (
                            <a key={item._key} href={item.link || "#"} style={{ display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "inherit", textAlign: "left" }}>
                                <div style={{ position: "relative", aspectRatio: data.aspect === "auto" ? undefined : data.aspect, borderRadius: radius, overflow: "hidden", background: PALETTE.navy }}>
                                    {src ? (
                                        <img src={src} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: data.imageFit || "cover", display: "block" }} />
                                    ) : (
                                        <Placeholder label="Tile image" height="100%" dark />
                                    )}
                                    {position === "overlay" && (item.title || item.subtitle) && (
                                        <span style={{ position: "absolute", inset: "auto 0 0 0", padding: 18, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", color: "#fff" }}>
                                            <span style={{ display: "block", fontSize: 18, fontWeight: 700 }}>{item.title}</span>
                                            {item.subtitle && <span style={{ fontSize: 13, opacity: 0.85 }}>{item.subtitle}</span>}
                                        </span>
                                    )}
                                </div>
                                {position === "below" && (item.title || item.subtitle) && (
                                    <span>
                                        <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{item.title}</span>
                                        {item.subtitle && <span style={{ fontSize: 13, opacity: 0.7 }}>{item.subtitle}</span>}
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </Grid>
            )}
        </>
    );
}

function RichText({ data, style, device }: RenderProps) {
    const paragraphs = String(data.body || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: alignItems(style), gap: 16 }}>
            <Eyebrow text={data.eyebrow} color={style.accentColor} />
            {data.heading && <h2 style={headingStyle(style, device)}>{data.heading}</h2>}
            {paragraphs.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: Number(data.bodySize) || 16, lineHeight: 1.75, color: style.mutedColor, whiteSpace: "pre-line" }}>
                    {p}
                </p>
            ))}
            <Button text={data.buttonText} href={data.buttonLink} style={style} device={device} />
        </div>
    );
}

function videoEmbed(url: string, autoplay: boolean, loop: boolean) {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    if (yt) {
        const params = new URLSearchParams({ rel: "0" });
        if (autoplay) {
            params.set("autoplay", "1");
            params.set("mute", "1");
        }
        if (loop) {
            params.set("loop", "1");
            params.set("playlist", yt[1]);
        }
        return { kind: "iframe" as const, src: `https://www.youtube.com/embed/${yt[1]}?${params}` };
    }
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) {
        return {
            kind: "iframe" as const,
            src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=${autoplay ? 1 : 0}&muted=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`,
        };
    }
    return { kind: "video" as const, src: url };
}

function Video(props: RenderProps) {
    const { data } = props;
    const [playing, setPlaying] = useState(false);
    const radius = Number(data.videoRadius ?? 24);
    const url = String(data.videoUrl || "");
    const embed = url ? videoEmbed(url, Boolean(data.autoplay) || playing, Boolean(data.loop)) : null;
    const showCover = data.thumbnail && !playing && !data.autoplay;

    return (
        <>
            <SectionHeader {...props} />
            <div style={{ position: "relative", aspectRatio: data.aspect || "16 / 9", borderRadius: radius, overflow: "hidden", background: "#000" }}>
                {!embed ? (
                    <Placeholder label="Paste a YouTube, Vimeo or MP4 link" height="100%" dark />
                ) : showCover ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPlaying(true);
                        }}
                        style={{ position: "absolute", inset: 0, padding: 0, border: "none", cursor: "pointer", background: "#000" }}
                        aria-label="Play video"
                    >
                        <img src={data.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: 999, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill={PALETTE.navy} aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                        </span>
                    </button>
                ) : embed.kind === "iframe" ? (
                    <iframe src={embed.src} title={data.heading || "Video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                ) : (
                    <video src={embed.src} controls autoPlay={Boolean(data.autoplay) || playing} muted={Boolean(data.autoplay)} loop={Boolean(data.loop)} playsInline poster={data.thumbnail || undefined} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                )}
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Engagement                                                          */
/* ------------------------------------------------------------------ */

function Testimonials(props: RenderProps) {
    const { data, style, device } = props;
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    return (
        <>
            <SectionHeader {...props} />
            {items.length === 0 ? (
                <Placeholder label="Add reviews in the settings panel" dark={isDark(style.background)} />
            ) : (
                <Grid columns={data.columns} mobileColumns={data.mobileColumns} device={device} gap={16}>
                    {items.map((item) => (
                        <figure key={item._key} style={{ ...cardStyle(data), margin: 0, padding: 22, display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
                            <span aria-label={`${item.rating} out of 5 stars`} style={{ color: "#d79b2b", letterSpacing: 2, fontSize: 16 }}>
                                {"★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 0)))}
                                <span style={{ opacity: 0.25 }}>{"★".repeat(5 - Math.max(0, Math.min(5, Number(item.rating) || 0)))}</span>
                            </span>
                            <blockquote style={{ margin: 0, fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-line" }}>{item.quote}</blockquote>
                            <figcaption style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                                {item.image && <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 999, objectFit: "cover" }} />}
                                <span>
                                    <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{item.name}</span>
                                    {item.location && <span style={{ fontSize: 12, opacity: 0.65 }}>{item.location}</span>}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </Grid>
            )}
        </>
    );
}

function Faq(props: RenderProps) {
    const { data, style } = props;
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    return (
        <>
            <SectionHeader {...props} marginBottom={22} />
            {items.length === 0 ? (
                <Placeholder label="Add questions in the settings panel" dark={isDark(style.background)} />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                    {items.map((item, index) => (
                        <details key={item._key} open={data.openFirst && index === 0} style={cardStyle(data)}>
                            <summary style={{ minHeight: 56, padding: "16px 20px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", listStyle: "none" }}>
                                {item.question}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </summary>
                            <p style={{ margin: 0, padding: "0 20px 18px", fontSize: 14, lineHeight: 1.65, opacity: 0.8, whiteSpace: "pre-line" }}>{item.answer}</p>
                        </details>
                    ))}
                </div>
            )}
        </>
    );
}

function Newsletter(props: RenderProps) {
    const { data, style, device } = props;
    const mobile = device === "mobile";
    const subscribe = useActions().subscribe;
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
    const [message, setMessage] = useState("");

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (!subscribe || status === "busy") return;
        setStatus("busy");
        setMessage("");
        try {
            await subscribe(email.trim());
            setStatus("done");
            setEmail("");
        } catch (err) {
            setStatus("error");
            setMessage(err instanceof Error ? err.message : "Something went wrong");
        }
    }
    return (
        <div style={{ ...cardStyle(data), display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, padding: mobile ? 22 : 36, overflow: "hidden" }}>
            <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: alignItems(style), gap: 12 }}>
                <Eyebrow text={data.eyebrow} color={style.accentColor} />
                {data.heading && <h2 style={headingStyle(style, device, 0.85)}>{data.heading}</h2>}
                {data.subheading && <p style={{ margin: 0, fontSize: 15, opacity: 0.75 }}>{data.subheading}</p>}
                {status === "done" ? (
                    <p role="status" style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 600, color: PALETTE.green }}>
                        {data.successText || "Thanks for subscribing!"}
                    </p>
                ) : (
                <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, width: "100%", maxWidth: 520, marginTop: 8 }}>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={data.placeholder} aria-label="Email" style={{ flex: "1 1 220px", height: 52, padding: "0 16px", borderRadius: 14, border: `1px solid ${PALETTE.border}`, fontSize: 15, fontFamily: "inherit", color: PALETTE.navy, background: "#fff" }} />
                    <button type="submit" style={{ height: 52, padding: "0 24px", borderRadius: 14, border: "none", background: style.buttonColor, color: style.buttonTextColor, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                        {status === "busy" ? "…" : data.buttonText || "Subscribe"}
                    </button>
                    {status === "error" && message && (
                        <span role="alert" style={{ width: "100%", fontSize: 12, color: "#d64545" }}>{message}</span>
                    )}
                </form>
                )}
            </div>
            {data.image && <img src={data.image} alt="" style={{ flex: "0 1 280px", maxWidth: "100%", borderRadius: 20, objectFit: "cover" }} />}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */

function numberOr(value: any, fallback?: number) {
    if (value === null || value === undefined || value === "") return fallback;
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
}

function isDark(color?: string) {
    if (!color || !color.startsWith("#") || (color.length !== 7 && color.length !== 4)) return false;
    const hex = color.length === 4 ? color.slice(1).split("").map((c) => c + c).join("") : color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
