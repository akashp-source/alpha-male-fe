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
}

/** Accepts the API's array / { products } / { data } shapes; keeps products with a banner. */
export function toFeaturedProducts(data: unknown): FeaturedProduct[] {
    const raw = Array.isArray(data)
        ? data
        : ((data as { products?: unknown; data?: unknown } | null)?.products ??
            (data as { data?: unknown } | null)?.data ??
            []);
    const list = Array.isArray(raw) ? (raw.flat(Infinity) as FeaturedProduct[]) : [];
    return list.filter(
        (product) => product && typeof product === "object" && product._id && product.bannerImages?.[0],
    );
}
