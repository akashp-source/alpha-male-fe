// Homepage "Featured products" slider data (GET /product/hero).
// Shared by the server fetch in Homepage and the client slider.

export interface FeaturedProduct {
    slug?: string;
    _id: string;
    name: string;
    description: string;
    images: string[];
    bannerImages: string[];
    price: number;
    compareAtPrice?: number | null;
    taglines?: {
        title: string;
        description: string;
        image?: string;
    }[];
    /** Product page theme (admin → Page theme); the featured slider uses it as its background. */
    pageTheme?: string;
    pageAccent?: string;
}

/**
 * Accepts the API's array / { products } / { data } shapes. Keeps every
 * featured product (a banner image is optional; images lists are always arrays).
 * Old rule, which hid featured products without a banner:
 *   list.filter((product) => product && typeof product === "object" && product._id && product.bannerImages?.[0])
 */
export function toFeaturedProducts(data: unknown): FeaturedProduct[] {
    const raw = Array.isArray(data)
        ? data
        : ((data as { products?: unknown; data?: unknown } | null)?.products ??
            (data as { data?: unknown } | null)?.data ??
            []);
    const list = Array.isArray(raw) ? (raw.flat(Infinity) as FeaturedProduct[]) : [];
    return list
        .filter((product) => product && typeof product === "object" && product._id)
        .map((product) => ({
            ...product,
            images: Array.isArray(product.images) ? product.images : [],
            bannerImages: Array.isArray(product.bannerImages) ? product.bannerImages : [],
        }));
}
