export interface Product {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: number;
    compareAtPrice: number | null;

    images: string[];
    bannerImages: string[];

    category: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;

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

    createdAt: string;
    updatedAt: string;
}