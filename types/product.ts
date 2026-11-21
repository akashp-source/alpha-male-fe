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
    }[];

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

    ratings?: ProductRatings;

    // Returned by GET /product/info/:id.
    recommendations?: ProductRecommendationsData;

    createdAt: string;
    updatedAt: string;
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
