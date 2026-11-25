/**
 * Caching for public product data (product page, homepage lists).
 *
 * Responses are cached and shared between visitors, so pages don't wait on
 * the backend every time. They stay fresh two ways:
 *  - The backend calls POST /api/revalidate when a product is added, edited
 *    or deleted in admin; the next visit then waits for fresh data.
 *  - As a safety net (e.g. stock changing after orders), cached data is
 *    refreshed in the background at most every PRODUCT_REVALIDATE_SECONDS.
 *
 * Only public, non-personal responses may use this. Cart, checkout and
 * account requests stay `cache: "no-store"`.
 */

export const PRODUCTS_TAG = "products";
export const PRODUCT_REVALIDATE_SECONDS = 30;

export const productFetchOptions: RequestInit = {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] },
};
