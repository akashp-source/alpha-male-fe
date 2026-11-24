// Shared with alphamale-admin-fe/Components/Campaign/config.ts. Keep both copies in sync.
import type { Product } from "@/types/product";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

// Must match CampaignSectionType in the backend campaign schema.
export type SectionType =
    | "hero"
    | "product_grid"
    | "product_carousel"
    | "image_text"
    | "promo_banner"
    | "rich_text"
    | "category_collection"
    | "testimonials"
    | "faq"
    | "countdown"
    | "video"
    | "benefits"
    | "comparison_table"
    | "newsletter"
    | "bundle_offers";

type TitledItem = { title: string; description: string; image?: string };

export type CampaignProduct = Product & {
    comboOffers?: {
        quantity: number;
        offerPrice: number;
        title?: string;
        description?: string;
    }[];
    faqs?: { question: string; answer: string }[];
    keyPoints?: TitledItem[];
    taglines?: TitledItem[];
    howToUse?: TitledItem[];
    highlights?: TitledItem[];
    claims?: TitledItem[];
};

export type CampaignSection = {
    id: string;
    type: SectionType;
    enabled: boolean;
    order: number;
    data: Record<string, any>;
};

export type CampaignStatus = "draft" | "published" | "archived";

export type Campaign = {
    _id?: string;
    name: string;
    slug: string;
    description: string;
    status: CampaignStatus;
    sections: CampaignSection[];
    schedule: { startsAt: string | null; endsAt: string | null };
    seo: { title: string; description: string; keywords: string; ogImage: string };
    settings: {
        backgroundColor: string;
        contentWidth: "full" | "contained";
        showAnnouncementBar: boolean;
    };
    primaryProductId: string | null;
    productIds: string[];
    createdAt?: string;
    updatedAt?: string;
};

export type Device = "desktop" | "mobile";

export type SectionStyle = {
    heightMode: "auto" | "min" | "fixed" | "screen";
    height: number;
    mobileHeight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingX: number;
    mobilePaddingTop: number;
    mobilePaddingBottom: number;
    mobilePaddingX: number;
    marginTop: number;
    mobileMarginTop: number;
    background: string;
    backgroundImage: string;
    mobileBackgroundImage: string;
    backgroundSize: "cover" | "contain" | "auto";
    backgroundPosition: string;
    overlayColor: string;
    overlayOpacity: number;
    textColor: string;
    mutedColor: string;
    accentColor: string;
    buttonColor: string;
    buttonTextColor: string;
    contentWidth: "narrow" | "contained" | "wide" | "full";
    align: "left" | "center" | "right";
    verticalAlign: "top" | "center" | "bottom";
    borderRadius: number;
    headingFont: "serif" | "sans";
    headingSize: number;
    mobileHeadingSize: number;
    hideOnDesktop: boolean;
    hideOnMobile: boolean;
    anchorId: string;
};

export type Option = { value: string; label: string };

export type FieldDef = {
    key: string;
    label: string;
    help?: string;
    placeholder?: string;
} & (
        | {
            kind:
            | "text"
            | "textarea"
            | "url"
            | "color"
            | "datetime"
            | "image"
            | "product"
            | "products"
            | "toggle";
        }
        | { kind: "number"; min?: number; max?: number; step?: number; suffix?: string }
        | { kind: "select"; options: Option[] }
        | {
            kind: "list";
            itemLabel: string;
            titleKey: string;
            fields: FieldDef[];
            newItem: () => Record<string, any>;
        }
    );

/* ------------------------------------------------------------------ */
/* Brand palette (from the Bold S campaign design)                     */
/* ------------------------------------------------------------------ */

export const PALETTE = {
    navy: "#212e49", // brand navy (--color-brand-navy)
    gold: "#e7c49c",
    cream: "#e9e9ea", // pale light gray (--color-pale-gray)
    dark: "#212e49", // brand navy (--color-brand-navy)
    green: "#176348", // accent pending review (--color-success-green)
    border: "#ece6dc",
    muted: "#6b6259",
    body: "#4a4038",
    soft: "#c3cad6",
    white: "#fefefe", // brand white (--color-white)
};

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export const FONT_LINK =
    "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function uid(prefix = "id") {
    const random =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}-${random}`;
}

export function inr(value: number | undefined | null) {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
    return "₹" + Math.round(Number(value)).toLocaleString("en-IN");
}

export function authToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export function authHeaders(): Record<string, string> {
    const token = authToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function productImages(product?: CampaignProduct | null) {
    if (!product) return [];
    return [...(product.images || []), ...(product.bannerImages || [])].filter(Boolean);
}

/** Upload an image to S3 through the backend and return its public URL. */
export async function uploadCampaignImage(file: File): Promise<string> {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
        throw new Error("Only JPG, PNG and WebP images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size cannot exceed 5 MB.");
    }

    const token = authToken();
    if (!token) throw new Error("Admin session expired. Please log in again.");

    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            typeof reader.result === "string"
                ? resolve(reader.result)
                : reject(new Error("Unable to read image"));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_URL}/product/product-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base64, contentType: file.type }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            Array.isArray(result.message)
                ? result.message.join(", ")
                : result.message || "Image upload failed",
        );
    }

    const url = result?.data?.url;
    if (!url) throw new Error("Upload succeeded but no image URL was returned.");
    return url;
}

/* ------------------------------------------------------------------ */
/* Default style + per-section overrides                               */
/* ------------------------------------------------------------------ */

export const DEFAULT_STYLE: SectionStyle = {
    heightMode: "auto",
    height: 520,
    mobileHeight: 0,
    paddingTop: 80,
    paddingBottom: 80,
    paddingX: 24,
    mobilePaddingTop: 48,
    mobilePaddingBottom: 48,
    mobilePaddingX: 16,
    marginTop: 0,
    mobileMarginTop: 0,
    background: "transparent",
    backgroundImage: "",
    mobileBackgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overlayColor: "#000000",
    overlayOpacity: 0,
    textColor: PALETTE.navy,
    mutedColor: PALETTE.body,
    accentColor: PALETTE.green,
    buttonColor: PALETTE.dark,
    buttonTextColor: PALETTE.gold,
    contentWidth: "contained",
    align: "left",
    verticalAlign: "center",
    borderRadius: 0,
    headingFont: "serif",
    headingSize: 38,
    mobileHeadingSize: 26,
    hideOnDesktop: false,
    hideOnMobile: false,
    anchorId: "",
};

const DARK_STYLE: Partial<SectionStyle> = {
    background: PALETTE.navy,
    textColor: PALETTE.white,
    mutedColor: PALETTE.soft,
    accentColor: PALETTE.gold,
    buttonColor: PALETTE.gold,
    buttonTextColor: PALETTE.dark,
};

/* ------------------------------------------------------------------ */
/* Reusable field groups                                               */
/* ------------------------------------------------------------------ */

const headerFields = (subheading = true): FieldDef[] => [
    { key: "eyebrow", label: "Small label above heading", kind: "text", placeholder: "LIMITED-TIME OFFER" },
    { key: "heading", label: "Heading", kind: "textarea", help: "Press Enter for a line break." },
    ...(subheading
        ? ([{ key: "subheading", label: "Sub-heading", kind: "textarea" }] as FieldDef[])
        : []),
];

const buttonFields = (prefix = "button", label = "Button"): FieldDef[] => [
    { key: `${prefix}Text`, label: `${label} text`, kind: "text", help: "Leave empty to hide." },
    {
        key: `${prefix}Link`,
        label: `${label} link`,
        kind: "url",
        placeholder: "/products/slug  or  #section-anchor",
    },
];

const cardFields: FieldDef[] = [
    { key: "cardBackground", label: "Card background", kind: "color" },
    { key: "cardTextColor", label: "Card text colour", kind: "color" },
    { key: "cardRadius", label: "Card corner radius", kind: "number", min: 0, max: 48, suffix: "px" },
];

const columnFields = (max = 6): FieldDef[] => [
    { key: "columns", label: "Columns (desktop)", kind: "number", min: 1, max },
    { key: "mobileColumns", label: "Columns (mobile)", kind: "number", min: 1, max: 3 },
];

const aspectOptions: Option[] = [
    { value: "16 / 9", label: "Wide 16:9" },
    { value: "16 / 8", label: "Banner 2:1" },
    { value: "4 / 3", label: "Landscape 4:3" },
    { value: "1 / 1", label: "Square 1:1" },
    { value: "3 / 4", label: "Portrait 3:4" },
    { value: "auto", label: "Original image ratio" },
];

const fitOptions: Option[] = [
    { value: "cover", label: "Fill (crop)" },
    { value: "contain", label: "Fit (no crop)" },
];

/* ------------------------------------------------------------------ */
/* Section library                                                     */
/* ------------------------------------------------------------------ */

type SectionDef = {
    label: string;
    description: string;
    group: "Hero & banners" | "Products" | "Content" | "Engagement";
    fields: FieldDef[];
    defaults: () => Record<string, any>;
    style?: Partial<SectionStyle>;
};

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
    hero: {
        label: "Hero banner",
        description: "Big headline, product image, price, timer and buttons",
        group: "Hero & banners",
        style: { ...DARK_STYLE, paddingTop: 72, paddingBottom: 104, headingSize: 60, mobileHeadingSize: 36 },
        fields: [
            {
                key: "layout",
                label: "Layout",
                kind: "select",
                options: [
                    { value: "split-right", label: "Text left, image right" },
                    { value: "split-left", label: "Image left, text right" },
                    { value: "centered", label: "Centred, image below" },
                    { value: "text-only", label: "Text only (use a background image)" },
                ],
            },
            ...headerFields(),
            { key: "productId", label: "Linked product", kind: "product", help: "Fills price and image automatically." },
            { key: "productImage", label: "Hero image", kind: "image", help: "Empty = the product's first image." },
            { key: "imageHeight", label: "Image size (desktop)", kind: "number", min: 160, max: 900, suffix: "px" },
            { key: "mobileImageHeight", label: "Image size (mobile)", kind: "number", min: 120, max: 600, suffix: "px" },
            { key: "imageRotate", label: "Image tilt", kind: "number", min: -20, max: 20, suffix: "°" },
            { key: "showImageCircle", label: "Glow circle behind image", kind: "toggle" },
            { key: "showPrice", label: "Show price", kind: "toggle" },
            { key: "price", label: "Price override", kind: "number", min: 0, help: "Empty = product price." },
            { key: "compareAtPrice", label: "Strike-through price override", kind: "number", min: 0 },
            { key: "badgeText", label: "Round badge (big text)", kind: "text", placeholder: "33%" },
            { key: "badgeSubtext", label: "Round badge (small text)", kind: "text", placeholder: "OFF" },
            { key: "chipText", label: "Floating chip text", kind: "text", placeholder: "Fast-dissolving strip" },
            { key: "showCountdown", label: "Show countdown", kind: "toggle" },
            { key: "countdownLabel", label: "Countdown label", kind: "text" },
            { key: "countdownEndsAt", label: "Countdown ends at", kind: "datetime" },
            ...buttonFields("primaryButton", "Primary button"),
            ...buttonFields("secondaryButton", "Secondary button"),
        ],
        defaults: () => ({
            layout: "split-right",
            eyebrow: "LIMITED-TIME OFFER",
            heading: "Your campaign headline",
            subheading: "Describe the offer in one or two short sentences.",
            productId: "",
            productImage: "",
            imageHeight: 440,
            mobileImageHeight: 300,
            imageRotate: -5,
            showImageCircle: true,
            showPrice: true,
            price: null,
            compareAtPrice: null,
            badgeText: "",
            badgeSubtext: "",
            chipText: "",
            showCountdown: false,
            countdownLabel: "OFFER ENDS IN",
            countdownEndsAt: inDays(3),
            primaryButtonText: "Shop now",
            primaryButtonLink: "",
            secondaryButtonText: "",
            secondaryButtonLink: "",
        }),
    },

    promo_banner: {
        label: "Promo banner",
        description: "Offer card or full-width message strip",
        group: "Hero & banners",
        style: { paddingTop: 40, paddingBottom: 40 },
        fields: [
            {
                key: "layout",
                label: "Layout",
                kind: "select",
                options: [
                    { value: "inline", label: "Text left, highlight right" },
                    { value: "centered", label: "Centred" },
                ],
            },
            { key: "iconText", label: "Icon circle text", kind: "text", placeholder: "✦  or  12%", help: "Leave empty to hide." },
            ...headerFields(),
            { key: "image", label: "Side image (optional)", kind: "image" },
            { key: "highlightLabel", label: "Highlight box label", kind: "text" },
            { key: "highlightValue", label: "Highlight box value", kind: "text" },
            ...buttonFields(),
            { key: "cardBackground", label: "Card background", kind: "color", help: "Clear it for no card." },
            { key: "cardTextColor", label: "Card text colour", kind: "color" },
            { key: "cardRadius", label: "Card corner radius", kind: "number", min: 0, max: 48, suffix: "px" },
        ],
        defaults: () => ({
            layout: "inline",
            iconText: "✦",
            eyebrow: "SPECIAL OFFER",
            heading: "Extra discount when you pay online",
            subheading: "On top of combo savings.",
            image: "",
            highlightLabel: "",
            highlightValue: "",
            buttonText: "",
            buttonLink: "",
            cardBackground: PALETTE.gold,
            cardTextColor: PALETTE.dark,
            cardRadius: 28,
        }),
    },

    countdown: {
        label: "Countdown",
        description: "Live timer until the offer ends",
        group: "Hero & banners",
        style: { ...DARK_STYLE, align: "center", paddingTop: 56, paddingBottom: 56 },
        fields: [
            ...headerFields(),
            { key: "endsAt", label: "Ends at", kind: "datetime" },
            { key: "expiredText", label: "Text after it ends", kind: "text" },
            ...buttonFields(),
        ],
        defaults: () => ({
            eyebrow: "HURRY",
            heading: "Offer ends soon",
            subheading: "",
            endsAt: inDays(3),
            expiredText: "This offer has ended.",
            buttonText: "Shop the offer",
            buttonLink: "",
        }),
    },

    product_grid: {
        label: "Product grid",
        description: "Selected products in a grid with Add to cart",
        group: "Products",
        fields: [
            ...headerFields(),
            { key: "productIds", label: "Products", kind: "products" },
            ...columnFields(),
            { key: "imageHeight", label: "Image height", kind: "number", min: 80, max: 600, suffix: "px" },
            { key: "imageFit", label: "Image fit", kind: "select", options: fitOptions },
            { key: "showPrice", label: "Show price", kind: "toggle" },
            { key: "showCompareAt", label: "Show strike-through price", kind: "toggle" },
            { key: "showAddToCart", label: "Show Add to cart button", kind: "toggle" },
            { key: "buttonText", label: "Card button text", kind: "text" },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "Shop the collection",
            subheading: "",
            productIds: [],
            columns: 4,
            mobileColumns: 2,
            imageHeight: 220,
            imageFit: "contain",
            showPrice: true,
            showCompareAt: true,
            showAddToCart: true,
            buttonText: "Add to cart",
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 20,
        }),
    },

    product_carousel: {
        label: "Product carousel",
        description: "Horizontally scrolling product cards",
        group: "Products",
        fields: [
            ...headerFields(),
            { key: "productIds", label: "Products", kind: "products" },
            { key: "cardWidth", label: "Card width", kind: "number", min: 160, max: 480, suffix: "px" },
            { key: "imageHeight", label: "Image height", kind: "number", min: 80, max: 600, suffix: "px" },
            { key: "imageFit", label: "Image fit", kind: "select", options: fitOptions },
            { key: "showPrice", label: "Show price", kind: "toggle" },
            { key: "showCompareAt", label: "Show strike-through price", kind: "toggle" },
            { key: "showAddToCart", label: "Show Add to cart button", kind: "toggle" },
            { key: "buttonText", label: "Card button text", kind: "text" },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "You may also like",
            subheading: "",
            productIds: [],
            cardWidth: 260,
            imageHeight: 220,
            imageFit: "contain",
            showPrice: true,
            showCompareAt: true,
            showAddToCart: true,
            buttonText: "Add to cart",
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 20,
        }),
    },

    bundle_offers: {
        label: "Combo / bundle offers",
        description: "Buy 1 / Buy 2 / Buy 3 pack cards with savings",
        group: "Products",
        style: { ...DARK_STYLE, align: "center", paddingTop: 72, paddingBottom: 72 },
        fields: [
            ...headerFields(),
            { key: "productId", label: "Product", kind: "product", help: "Used for pack images and Add to cart." },
            ...columnFields(4),
            { key: "packImageHeight", label: "Pack image height", kind: "number", min: 60, max: 400, suffix: "px" },
            {
                key: "items",
                label: "Packs",
                kind: "list",
                itemLabel: "Pack",
                titleKey: "title",
                fields: [
                    { key: "title", label: "Title", kind: "text" },
                    { key: "quantity", label: "Quantity", kind: "number", min: 1, max: 20 },
                    { key: "price", label: "Offer price", kind: "number", min: 0 },
                    { key: "compareAtPrice", label: "Strike-through price", kind: "number", min: 0 },
                    { key: "ribbon", label: "Ribbon", kind: "text", placeholder: "BEST VALUE" },
                    { key: "description", label: "Short note", kind: "text" },
                    { key: "image", label: "Pack image", kind: "image", help: "Empty = product image stacked by quantity." },
                    { key: "buttonText", label: "Button text", kind: "text" },
                    { key: "highlighted", label: "Pre-selected", kind: "toggle" },
                ],
                newItem: () => ({
                    _key: uid("pack"),
                    title: "New pack",
                    quantity: 1,
                    price: 0,
                    compareAtPrice: 0,
                    ribbon: "",
                    description: "",
                    image: "",
                    buttonText: "Add to cart",
                    highlighted: false,
                }),
            },
            { key: "showSavings", label: "Show 'Save ₹' pill", kind: "toggle" },
            { key: "showPerUnit", label: "Show per-pack price", kind: "toggle" },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "COMBO OFFERS",
            heading: "Buy more, save more",
            subheading: "Stock up and pay less per pack.",
            productId: "",
            columns: 3,
            mobileColumns: 1,
            packImageHeight: 130,
            items: [],
            showSavings: true,
            showPerUnit: true,
            cardBackground: PALETTE.cream,
            cardTextColor: PALETTE.navy,
            cardRadius: 24,
        }),
    },

    comparison_table: {
        label: "Comparison table",
        description: "Compare products or us vs. others",
        group: "Products",
        style: { contentWidth: "narrow" },
        fields: [
            ...headerFields(),
            { key: "productIds", label: "Product columns", kind: "products", help: "Or type custom columns below." },
            { key: "customColumns", label: "Custom columns", kind: "text", placeholder: "Alpha Male | Others", help: "Separate with |" },
            { key: "highlightColumn", label: "Highlight column number", kind: "number", min: 0, max: 8, help: "0 = none" },
            {
                key: "rows",
                label: "Rows",
                kind: "list",
                itemLabel: "Row",
                titleKey: "label",
                fields: [
                    { key: "label", label: "Feature", kind: "text" },
                    { key: "values", label: "Values", kind: "text", help: "Separate with |   Use yes / no for ticks." },
                ],
                newItem: () => ({ _key: uid("row"), label: "Feature", values: "yes | no" }),
            },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "How we compare",
            subheading: "",
            productIds: [],
            customColumns: "",
            highlightColumn: 1,
            rows: [],
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 20,
        }),
    },

    image_text: {
        label: "Image with text",
        description: "Image or gallery beside text, bullets and a button",
        group: "Content",
        fields: [
            { key: "imagePosition", label: "Image side", kind: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
            { key: "image", label: "Main image", kind: "image" },
            {
                key: "gallery",
                label: "More gallery images",
                kind: "list",
                itemLabel: "Image",
                titleKey: "alt",
                fields: [
                    { key: "image", label: "Image", kind: "image" },
                    { key: "alt", label: "Description", kind: "text" },
                ],
                newItem: () => ({ _key: uid("img"), image: "", alt: "" }),
            },
            { key: "imageWidth", label: "Image column width", kind: "number", min: 25, max: 75, suffix: "%" },
            { key: "imageAspect", label: "Image shape", kind: "select", options: aspectOptions },
            { key: "imageFit", label: "Image fit", kind: "select", options: fitOptions },
            { key: "imageRadius", label: "Image corner radius", kind: "number", min: 0, max: 60, suffix: "px" },
            ...headerFields(false),
            { key: "description", label: "Text", kind: "textarea" },
            {
                key: "bullets",
                label: "Feature points",
                kind: "list",
                itemLabel: "Point",
                titleKey: "title",
                fields: [
                    { key: "title", label: "Title", kind: "text" },
                    { key: "text", label: "Text", kind: "textarea" },
                ],
                newItem: () => ({ _key: uid("pt"), title: "Feature", text: "" }),
            },
            { key: "bulletColumns", label: "Point columns", kind: "number", min: 1, max: 3 },
            ...buttonFields(),
        ],
        defaults: () => ({
            imagePosition: "left",
            image: "",
            gallery: [],
            imageWidth: 50,
            imageAspect: "16 / 9",
            imageFit: "cover",
            imageRadius: 24,
            eyebrow: "WHY IT WORKS",
            heading: "Made for performance.",
            description: "Tell customers what makes this product special.",
            bullets: [],
            bulletColumns: 2,
            buttonText: "",
            buttonLink: "",
        }),
    },

    benefits: {
        label: "Benefits / steps / offer strip",
        description: "Icon cards, numbered steps or highlight strip",
        group: "Content",
        fields: [
            {
                key: "layout",
                label: "Style",
                kind: "select",
                options: [
                    { value: "cards", label: "Cards with tick icon" },
                    { value: "strip", label: "Offer strip (round badge + text)" },
                    { value: "steps", label: "Numbered steps" },
                    { value: "icons", label: "Centred image / icon" },
                ],
            },
            ...headerFields(),
            ...columnFields(),
            {
                key: "items",
                label: "Items",
                kind: "list",
                itemLabel: "Item",
                titleKey: "title",
                fields: [
                    { key: "badge", label: "Badge / number", kind: "text", help: "e.g. ₹498, 12%, 01. Empty = icon." },
                    { key: "image", label: "Image / icon", kind: "image" },
                    { key: "title", label: "Title", kind: "text" },
                    { key: "text", label: "Text", kind: "textarea" },
                ],
                newItem: () => ({ _key: uid("item"), badge: "", image: "", title: "Benefit", text: "" }),
            },
            { key: "imageSize", label: "Image / icon size", kind: "number", min: 24, max: 240, suffix: "px" },
            ...cardFields,
        ],
        defaults: () => ({
            layout: "cards",
            eyebrow: "",
            heading: "Why choose us",
            subheading: "",
            columns: 4,
            mobileColumns: 1,
            items: [],
            imageSize: 64,
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 18,
        }),
    },

    category_collection: {
        label: "Image tiles / banners",
        description: "Grid of clickable images (categories, banners, lifestyle)",
        group: "Content",
        fields: [
            ...headerFields(),
            ...columnFields(),
            { key: "aspect", label: "Tile shape", kind: "select", options: aspectOptions },
            { key: "imageFit", label: "Image fit", kind: "select", options: fitOptions },
            { key: "tileRadius", label: "Tile corner radius", kind: "number", min: 0, max: 60, suffix: "px" },
            {
                key: "titlePosition",
                label: "Tile text",
                kind: "select",
                options: [
                    { value: "below", label: "Below the image" },
                    { value: "overlay", label: "On the image" },
                    { value: "none", label: "Hidden" },
                ],
            },
            {
                key: "items",
                label: "Tiles",
                kind: "list",
                itemLabel: "Tile",
                titleKey: "title",
                fields: [
                    { key: "image", label: "Image", kind: "image" },
                    { key: "mobileImage", label: "Mobile image (optional)", kind: "image" },
                    { key: "title", label: "Title", kind: "text" },
                    { key: "subtitle", label: "Subtitle", kind: "text" },
                    { key: "link", label: "Link", kind: "url" },
                ],
                newItem: () => ({ _key: uid("tile"), image: "", mobileImage: "", title: "", subtitle: "", link: "" }),
            },
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "",
            subheading: "",
            columns: 2,
            mobileColumns: 1,
            aspect: "16 / 8",
            imageFit: "cover",
            tileRadius: 24,
            titlePosition: "none",
            items: [],
        }),
    },

    rich_text: {
        label: "Text block",
        description: "Heading and paragraphs",
        group: "Content",
        style: { contentWidth: "narrow" },
        fields: [
            ...headerFields(false),
            { key: "body", label: "Text", kind: "textarea", help: "Leave a blank line between paragraphs." },
            { key: "bodySize", label: "Text size", kind: "number", min: 12, max: 28, suffix: "px" },
            ...buttonFields(),
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "About this campaign",
            body: "Write your campaign story here.",
            bodySize: 16,
            buttonText: "",
            buttonLink: "",
        }),
    },

    video: {
        label: "Video",
        description: "YouTube, Vimeo or MP4 video",
        group: "Content",
        style: { contentWidth: "narrow" },
        fields: [
            ...headerFields(),
            { key: "videoUrl", label: "Video URL", kind: "url", placeholder: "https://youtube.com/watch?v=…" },
            { key: "thumbnail", label: "Cover image", kind: "image" },
            { key: "aspect", label: "Shape", kind: "select", options: aspectOptions.filter((o) => o.value !== "auto") },
            { key: "videoRadius", label: "Corner radius", kind: "number", min: 0, max: 48, suffix: "px" },
            { key: "autoplay", label: "Autoplay (muted)", kind: "toggle" },
            { key: "loop", label: "Loop", kind: "toggle" },
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "See it in action",
            subheading: "",
            videoUrl: "",
            thumbnail: "",
            aspect: "16 / 9",
            videoRadius: 24,
            autoplay: false,
            loop: false,
        }),
    },

    testimonials: {
        label: "Testimonials",
        description: "Customer reviews with ratings",
        group: "Engagement",
        fields: [
            ...headerFields(),
            ...columnFields(4),
            {
                key: "items",
                label: "Reviews",
                kind: "list",
                itemLabel: "Review",
                titleKey: "name",
                fields: [
                    { key: "name", label: "Name", kind: "text" },
                    { key: "location", label: "City / note", kind: "text" },
                    { key: "rating", label: "Stars", kind: "number", min: 0, max: 5 },
                    { key: "quote", label: "Review", kind: "textarea" },
                    { key: "image", label: "Photo (optional)", kind: "image" },
                ],
                newItem: () => ({ _key: uid("review"), name: "Customer", location: "", rating: 5, quote: "", image: "" }),
            },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "REVIEWS",
            heading: "What our customers say",
            subheading: "",
            columns: 3,
            mobileColumns: 1,
            items: [],
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 20,
        }),
    },

    faq: {
        label: "FAQ",
        description: "Expandable questions and answers",
        group: "Engagement",
        style: { contentWidth: "narrow", align: "center" },
        fields: [
            ...headerFields(),
            { key: "openFirst", label: "Open first question", kind: "toggle" },
            {
                key: "items",
                label: "Questions",
                kind: "list",
                itemLabel: "Question",
                titleKey: "question",
                fields: [
                    { key: "question", label: "Question", kind: "text" },
                    { key: "answer", label: "Answer", kind: "textarea" },
                ],
                newItem: () => ({ _key: uid("faq"), question: "New question", answer: "" }),
            },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "NEED TO KNOW?",
            heading: "Frequently asked questions",
            subheading: "",
            openFirst: false,
            items: [],
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 16,
        }),
    },

    newsletter: {
        label: "Newsletter / sign-up",
        description: "Email capture box",
        group: "Engagement",
        style: { contentWidth: "narrow", align: "center" },
        fields: [
            ...headerFields(),
            { key: "placeholder", label: "Input placeholder", kind: "text" },
            { key: "buttonText", label: "Button text", kind: "text" },
            { key: "successText", label: "Message after sign-up", kind: "text" },
            { key: "image", label: "Side image (optional)", kind: "image" },
            ...cardFields,
        ],
        defaults: () => ({
            eyebrow: "",
            heading: "Get offers first",
            subheading: "Join our list for early access to campaigns.",
            placeholder: "Enter your email",
            buttonText: "Subscribe",
            successText: "Thanks! You're on the list.",
            image: "",
            cardBackground: PALETTE.white,
            cardTextColor: PALETTE.navy,
            cardRadius: 28,
        }),
    },
};

export const SECTION_GROUPS: SectionDef["group"][] = [
    "Hero & banners",
    "Products",
    "Content",
    "Engagement",
];

export const SECTION_TYPES = Object.keys(SECTION_DEFS) as SectionType[];

/* ------------------------------------------------------------------ */
/* Section helpers                                                     */
/* ------------------------------------------------------------------ */

export function resolveStyle(section: CampaignSection): SectionStyle {
    return {
        ...DEFAULT_STYLE,
        ...(SECTION_DEFS[section.type]?.style || {}),
        ...(section.data?.style || {}),
    };
}

export function resolveData(section: CampaignSection): Record<string, any> {
    return { ...SECTION_DEFS[section.type]?.defaults(), ...(section.data || {}) };
}

export function isHiddenOn(section: CampaignSection, device: Device) {
    const style = resolveStyle(section);
    return device === "mobile" ? style.hideOnMobile : style.hideOnDesktop;
}

export function createSection(
    type: SectionType,
    data: Record<string, any> = {},
    style: Partial<SectionStyle> = {},
): CampaignSection {
    return {
        id: uid("section"),
        type,
        enabled: true,
        order: 1,
        data: {
            ...SECTION_DEFS[type].defaults(),
            ...data,
            style: { ...style },
        },
    };
}

/** Deep clone with fresh ids so duplicates never collide. */
export function cloneSection(section: CampaignSection): CampaignSection {
    const data = JSON.parse(JSON.stringify(section.data || {}));
    Object.values(data).forEach((value) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item && typeof item === "object" && "_key" in item) item._key = uid("item");
            });
        }
    });
    if (data.style?.anchorId) data.style.anchorId = `${data.style.anchorId}-copy`;
    return { ...section, id: uid("section"), data };
}

export function sectionTitle(section: CampaignSection) {
    const heading = String(section.data?.heading || "").split("\n")[0].trim();
    return heading || SECTION_DEFS[section.type]?.label || section.type;
}

/** Every product id referenced anywhere in the campaign. */
export function collectProductIds(campaign: Campaign) {
    const ids = new Set<string>(campaign.productIds || []);
    if (campaign.primaryProductId) ids.add(campaign.primaryProductId);
    campaign.sections.forEach((section) => {
        const data = section.data || {};
        if (typeof data.productId === "string" && data.productId) ids.add(data.productId);
        if (Array.isArray(data.productIds)) data.productIds.forEach((id: string) => id && ids.add(id));
    });
    return [...ids];
}

function inDays(days: number) {
    const date = new Date(Date.now() + days * 86400000);
    date.setSeconds(0, 0);
    return date.toISOString();
}

export function createEmptyCampaign(): Campaign {
    return {
        name: "",
        slug: "",
        description: "",
        status: "draft",
        sections: [],
        schedule: { startsAt: null, endsAt: null },
        seo: { title: "", description: "", keywords: "", ogImage: "" },
        settings: {
            backgroundColor: PALETTE.cream,
            contentWidth: "full",
            showAnnouncementBar: true,
        },
        primaryProductId: null,
        productIds: [],
    };
}

export function normalizeCampaign(raw: any): Campaign {
    const empty = createEmptyCampaign();
    const toId = (value: any) =>
        value && typeof value === "object" ? String(value._id ?? "") : value ? String(value) : "";

    // Drop response-only extras so they are never sent back on save.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { products, primaryProduct, ...rest } = raw || {};

    return {
        ...empty,
        ...rest,
        description: raw?.description ?? "",
        schedule: { ...empty.schedule, ...(raw?.schedule || {}) },
        seo: { ...empty.seo, ...(raw?.seo || {}) },
        settings: { ...empty.settings, ...(raw?.settings || {}) },
        sections: [...(raw?.sections || [])]
            .sort((a: CampaignSection, b: CampaignSection) => (a.order ?? 0) - (b.order ?? 0))
            .map((section: CampaignSection) => ({ ...section, data: section.data || {} })),
        primaryProductId: toId(raw?.primaryProductId) || null,
        productIds: (raw?.productIds || []).map(toId).filter(Boolean),
    };
}

/* ------------------------------------------------------------------ */
/* Starter templates                                                   */
/* ------------------------------------------------------------------ */

export type TemplateKind = "offer" | "collection" | "blank";

export const TEMPLATES: { kind: TemplateKind; label: string; description: string }[] = [
    {
        kind: "offer",
        label: "Single-product offer page",
        description:
            "Hero with price and timer, offer strip, product gallery, combo packs, special offer, how to use, FAQ and final call to action. Filled from the main product.",
    },
    {
        kind: "collection",
        label: "Multi-product sale page",
        description:
            "Banner, countdown, grid of all selected products, a comparison table, reviews and FAQ.",
    },
    {
        kind: "blank",
        label: "Blank page",
        description: "Start empty and add any sections you want.",
    },
];

export function buildTemplate(
    kind: TemplateKind,
    primary: CampaignProduct | null,
    products: CampaignProduct[],
): CampaignSection[] {
    if (kind === "blank") return [];

    const productIds = products.map((p) => p._id);

    if (kind === "collection" || !primary) {
        const hero = createSection(
            "hero",
            {
                layout: primary ? "split-right" : "text-only",
                eyebrow: "LIMITED-TIME SALE",
                heading: "The big sale\nis on now",
                subheading: "Save on our best-sellers while the offer lasts.",
                productId: primary?._id || "",
                showPrice: false,
                showCountdown: true,
                primaryButtonText: "Shop the sale",
                primaryButtonLink: "#shop",
            },
        );
        return withOrder([
            hero,
            createSection(
                "product_grid",
                { eyebrow: "ON SALE", heading: "Shop the offer", productIds, columns: Math.min(4, Math.max(2, productIds.length)) },
                { anchorId: "shop", align: "center" },
            ),
            createSection(
                "promo_banner",
                {},
            ),
            ...(productIds.length > 1
                ? [
                    createSection("comparison_table", {
                        productIds,
                        rows: [
                            { _key: uid("row"), label: "Price", values: products.map((p) => inr(p.price)).join(" | ") },
                            { _key: uid("row"), label: "Discreet delivery", values: products.map(() => "yes").join(" | ") },
                        ],
                    }, { align: "center" }),
                ]
                : []),
            createSection("testimonials", {
                items: [
                    { _key: uid("review"), name: "Verified buyer", location: "", rating: 5, quote: "Add a real customer review here.", image: "" },
                ],
            }, { align: "center" }),
            createSection("faq", { items: defaultFaqs(null) }, { anchorId: "faq" }),
        ]);
    }

    // Single-product offer page (mirrors the Bold S campaign design).
    const p = primary;
    const price = Number(p.price) || 0;
    const mrp = Number(p.compareAtPrice) || 0;
    const percent = mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const images = productImages(p);
    const combos = buildPacks(p);
    const best = combos[combos.length - 1];
    const bestSaving = best ? Math.max(0, (best.compareAtPrice || 0) - (best.price || 0)) : 0;

    const features = [...(p.keyPoints || []), ...(p.highlights || [])].slice(0, 4);
    const steps = (p.howToUse || []).slice(0, 4);
    const tagline = p.taglines?.[0];

    return withOrder([
        createSection("hero", {
            layout: "split-right",
            eyebrow: "LIMITED-TIME OFFER",
            heading: percent ? `${p.name},\nnow ${percent}% off.` : p.name,
            subheading: truncate(p.description || "", 200),
            productId: p._id,
            productImage: images[0] || "",
            badgeText: percent ? `${percent}%` : "",
            badgeSubtext: percent ? "OFF" : "",
            chipText: "",
            showCountdown: true,
            primaryButtonText: `Add to cart · ${inr(price)}`,
            primaryButtonLink: "",
            secondaryButtonText: combos.length > 1 ? "See combo offers" : "",
            secondaryButtonLink: "#combos",
        }),
        createSection(
            "benefits",
            {
                layout: "strip",
                eyebrow: "",
                heading: "",
                subheading: "",
                columns: 3,
                items: [
                    ...(bestSaving
                        ? [{ _key: uid("item"), badge: inr(bestSaving), image: "", title: `Save up to ${inr(bestSaving)}`, text: "with combo packs" }]
                        : []),
                    { _key: uid("item"), badge: "", image: "", title: "100% discreet delivery", text: "plain packaging, private billing" },
                    { _key: uid("item"), badge: "", image: "", title: "Secure payments", text: "UPI, cards and cash on delivery" },
                ],
                cardRadius: 18,
            },
            { paddingTop: 0, paddingBottom: 0, mobilePaddingTop: 0, mobilePaddingBottom: 0, marginTop: -36, mobileMarginTop: -36 },
        ),
        createSection(
            "image_text",
            {
                eyebrow: `WHY ${p.name.toUpperCase()}`,
                heading: tagline?.title || "Made for performance. Built for privacy.",
                description: tagline?.description || truncate(p.description || "", 260),
                image: images[0] || "",
                gallery: images.slice(1, 4).map((image) => ({ _key: uid("img"), image, alt: p.name })),
                bullets: features.map((f) => ({ _key: uid("pt"), title: f.title, text: f.description })),
            },
            { anchorId: "product" },
        ),
        ...(combos.length
            ? [
                createSection(
                    "bundle_offers",
                    { productId: p._id, items: combos, columns: Math.min(4, combos.length) },
                    { anchorId: "combos" },
                ),
            ]
            : []),
        createSection("promo_banner", {
            highlightLabel: best ? `${best.title} paid online:` : "",
            highlightValue: best ? inr((best.price || 0) * 0.88) : "",
        }),
        createSection(
            "benefits",
            {
                layout: "steps",
                eyebrow: "HOW TO USE",
                heading: steps.length ? `${steps.length} simple steps` : "How to use",
                columns: 4,
                items: (steps.length
                    ? steps
                    : [{ title: "", description: "Add the first step here." }]
                ).map((s, i) => ({
                    _key: uid("item"),
                    badge: String(i + 1).padStart(2, "0"),
                    image: "",
                    title: s.title || "",
                    text: s.description || "",
                })),
            },
            { anchorId: "how", paddingBottom: images.length > 1 ? 24 : 80 },
        ),
        ...(images.length > 1 || (p.bannerImages || []).length
            ? [
                createSection(
                    "category_collection",
                    {
                        columns: 2,
                        items: ((p.bannerImages || []).length ? p.bannerImages! : images.slice(1, 3))
                            .slice(0, 4)
                            .map((image) => ({ _key: uid("tile"), image, mobileImage: "", title: "", subtitle: "", link: "" })),
                    },
                    { paddingTop: 0 },
                ),
            ]
            : []),
        createSection("faq", { eyebrow: "NEED TO KNOW?", heading: "Offer FAQs", items: defaultFaqs(p) }, { anchorId: "faq" }),
        createSection(
            "promo_banner",
            {
                layout: "inline",
                iconText: "",
                eyebrow: "",
                heading: "Don't miss the offer",
                subheading: best
                    ? `${p.name} from ${inr((best.price || 0) / (best.quantity || 1))} per pack with the ${best.title.toLowerCase()}.`
                    : `Get ${p.name} at the campaign price today.`,
                buttonText: "Shop the offer",
                buttonLink: combos.length ? "#combos" : "",
                cardBackground: "",
                cardRadius: 0,
            },
            { ...DARK_STYLE, paddingTop: 56, paddingBottom: 56, marginTop: 72, mobileMarginTop: 48 },
        ),
    ]);
}

function buildPacks(p: CampaignProduct) {
    const price = Number(p.price) || 0;
    const unitMrp = Number(p.compareAtPrice) || price;
    const offers = [...(p.comboOffers || [])].sort((a, b) => a.quantity - b.quantity);

    const packs = [
        {
            _key: uid("pack"),
            title: "Single pack",
            quantity: 1,
            price,
            compareAtPrice: unitMrp,
            ribbon: "",
            description: "",
            image: "",
            buttonText: "Add to cart",
            highlighted: offers.length === 0,
        },
        ...offers.map((offer, index) => ({
            _key: uid("pack"),
            title: offer.title || `Buy ${offer.quantity}`,
            quantity: offer.quantity,
            price: offer.offerPrice,
            compareAtPrice: unitMrp * offer.quantity,
            ribbon: index === offers.length - 1 ? "BEST VALUE" : index === 0 && offers.length > 1 ? "MOST POPULAR" : "",
            description: offer.description || "",
            image: "",
            buttonText: "Add to cart",
            highlighted: index === offers.length - 1,
        })),
    ];

    return offers.length ? packs : price ? packs : [];
}

function defaultFaqs(p: CampaignProduct | null) {
    const fromProduct = (p?.faqs || []).slice(0, 6).map((f) => ({
        _key: uid("faq"),
        question: f.question,
        answer: f.answer,
    }));
    if (fromProduct.length) return fromProduct;
    return [
        { _key: uid("faq"), question: "How long does this offer last?", answer: "The campaign price is available until the timer runs out." },
        { _key: uid("faq"), question: "Is the packaging discreet?", answer: "Yes. Every order ships in plain packaging with private billing." },
        { _key: uid("faq"), question: "Is cash on delivery available?", answer: "Add your COD policy here." },
    ];
}

function truncate(text: string, max: number) {
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

function withOrder(sections: CampaignSection[]) {
    return sections.map((section, index) => ({ ...section, order: index + 1 }));
}
