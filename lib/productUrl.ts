/**
 * Storefront URL of a product page: /products/<slug>.
 *
 * Falls back to the id when a list response has no slug; /products/<id>
 * still works and permanently redirects to the slug URL.
 */
export function productHref(product: { _id: string; slug?: string | null }) {
    const key = product.slug?.trim() || product._id;
    return `/products/${encodeURIComponent(key)}`;
}

/** True for a MongoDB ObjectId (24 hex characters), i.e. an old id-based URL. */
export function isProductId(value: string) {
    return /^[a-f0-9]{24}$/i.test(value);
}
