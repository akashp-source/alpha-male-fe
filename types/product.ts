export interface Product {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    detailedDescription?: string;

    // Optional SEO overrides; used by generateMetadata on the product page
    // when present. Not returned by the API yet.
    metaTitle?: string;
    metaDescription?: string;
    // e.g. "Pack of 10". Appended to the page title when present.
    packSize?: string;

    price: number;
    compareAtPrice: number | null;

    images: string[];
    bannerImages: string[];

    category: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    isBestSeller?: boolean;

    comboOffers: {
        quantity: number;
        offerPrice: number;
        title?: string;
        description?: string;
        // Short label on the pack option, e.g. "Popular".
        badge?: string;
    }[];

    // Prescription-only: the order gets a short consultation call.
    requiresPrescription?: boolean;

    // Units in one pack, e.g. { units: 10, unitLabel: "strips" }.
    packSizing?: {
        units: number;
        unitLabel: string;
        alternatives?: string[];
    } | null;

    // "Choose strength": this product + its other strengths (GET /product/info/:id).
    // Empty when there is no other strength.
    strengthOptions?: ProductStrengthOption[];

    // Tick-list points under the short description.
    quickPoints?: string[];

    // Manufacturing licence number for the trust bar (null = hidden).
    licenceNumber?: string | null;

    // Percent off for quantities above the largest combo tier (0 = off).
    bulkDiscountPercent?: number;

    betterTogether: {
        productId: string;
    }[];

    campaigns: {
        title: string;
        image: string;
        description?: string;
    }[];

    faqs: {
        question: string;
        answer: string;
    }[];

    frequentlyBoughtTogether: {
        productIds: string[];
        discountedPrice: number;
        title?: string;
        description?: string;
    }[];

    comparedProducts: {
        productId: string;
        image: string;
        price: number;
    }[];

    keyPoints: {
        title: string;
        image: string;
        description: string;
    }[];

    taglines: {
        title: string;
        description: string;
        image?: string;
    }[];

    howToUse: {
        title: string;
        image: string;
        description: string;
    }[];

    claims: {
        title: string;
        image: string;
        description: string;
    }[];

    comparison?: {
        heading: string;
        subheading?: string;
        ourLabel: string;
        ourImage?: string;
        ourBadge?: string;
        otherLabel: string;
        otherImage?: string;
        // Older data uses { label, ourValue, otherValue }; the admin editor
        // saves { ours, others }. ProductComparison handles both.
        rows: (
            | { label: string; ourValue: string; otherValue: string }
            | {
                ours: { title: string; description?: string };
                others: { title: string; description?: string };
            }
        )[];
    } | null;

    // "Product information" table + pack image (null = section hidden).
    productInformation?: {
        image?: string;
        imageCaption?: string;
        rows: { label: string; value: string }[];
    } | null;

    // "Read before use" safety box (null = section hidden).
    safetyInfo?: {
        title?: string;
        points: string[];
    } | null;

    // "Why choose" label + centre badge text (null = name/strength defaults).
    highlightsBadge?: {
        eyebrow?: string;
        name?: string;
        strength?: string;
    } | null;

    // Heading above the story banners (null = none).
    storyHeader?: {
        eyebrow: string;
        title: string;
        subtitle: string;
    } | null;

    // Product-page story banners, in order. layout: feature | steps | split | hero;
    // theme: light | pale | navy.
    storyBanners?: {
        layout: string;
        theme: string;
        number: string;
        eyebrow: string;
        title: string;
        subtitle: string;
        body: string;
        image: string;
        imageAlt: string;
        imageBadge: string;
        items: { title: string; text: string; image: string }[];
        tags: string[];
    }[];

    ratings?: ProductRatings;

    // Returned by GET /product/info/:id.
    recommendations?: ProductRecommendationsData;

    // Add-on tick-box next to the buy buttons (GET /product/info/:id).
    // null when the product has no add-on or it is inactive / out of stock.
    upsellProduct?: ProductUpsell | null;

    createdAt: string;
    updatedAt: string;
}

export interface ProductStrengthOption {
    _id: string;
    name: string;
    slug?: string;
    // e.g. "25 mg"
    label: string;
    price: number;
    inStock: boolean;
    // true for the product being viewed.
    current: boolean;
}

export interface ProductUpsell {
    _id: string;
    name: string;
    slug?: string;
    // The add-on's own prices; cart and checkout charge `price`.
    price: number;
    compareAtPrice?: number | null;
    image?: string;
    stock: number;
    // Admin wording; blank title falls back to "Add <name>".
    title?: string;
    description?: string;
}

export interface ProductReview {
    _id: string;
    rating: number;
    title: string | null;
    description: string | null;
    userName: string;
    verifiedPurchase: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRatingSummary {
    average: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ProductRatings {
    summary: ProductRatingSummary;
    reviews: ProductReview[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface RecommendedProductSummary {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    compareAtPrice?: number | null;
    images?: string[];
    category?: string;
    stock: number;
    isActive?: boolean;
}

export interface ProductRecommendationsData {
    frequentlyBoughtTogether?: {
        products: {
            product: RecommendedProductSummary;
            score?: number;
            purchaseCount?: number;
            confidence?: number;
            lift?: number;
        }[];
        sourceCount?: number;
        generatedAt?: string | null;
    };
    youMayAlsoLike?: {
        products: RecommendedProductSummary[];
        source?: string;
        category?: string;
    };
}
