
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import type { Product } from "@/types/product";

import Navbar from "@/Components/Home/NavBar";
import ProductPageView from "@/Components/Product/ProductPageView";
import { productHref } from "@/lib/productUrl";
import { productFetchOptions } from "@/lib/product-cache";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// URL: /products/<slug>. The folder is still named [id] because the segment
// also accepts the old /products/<id> form, which redirects to the slug URL.
// GET /product/info/:id accepts either an id or a slug.
async function getProduct(idOrSlug: string) {
    try {
        const response = await fetch(
            `${API_URL}/product/info/${encodeURIComponent(idOrSlug)}`,
            // Cached and shared; cleared by /api/revalidate when admin changes a
            // product (see lib/product-cache.ts).
            {
                method: "GET",
                ...productFetchOptions,
            }
        );

        // 400 = not a valid id or slug: treat like a missing product.
        if (response.status === 404 || response.status === 400) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        return await response.json();
    } catch (error) {
        console.error("Product API Error:", error);
        throw error;
    }
}

// Turns the (sometimes bulleted, sometimes literal "\n"-separated) product
// description into one plain line, cut to `max` characters on a word boundary.
function truncate(text: string, max = 155) {
    const clean = text
        .split(/\r?\n|\\n/)
        .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
        .filter(Boolean)
        .map((line) => (/[.!?]$/.test(line) ? line : `${line}.`))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "");
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    // Same request as the page; Next.js memoizes it, so no extra API call.
    // Metadata must never break the page, so fall back to the defaults on error.
    let product: Product | null = null;
    try {
        product = await getProduct(id);
    } catch {
        return {};
    }

    if (!product || !product.isActive) return {};

    const baseTitle = product.packSize
        ? `${product.name} (${product.packSize})`
        : product.name;
    const title = product.metaTitle?.trim() || baseTitle;
    const description =
        product.metaDescription?.trim() ||
        (product.description ? truncate(product.description) : undefined);
    const image = product.images?.[0];
    // Canonical is always the slug URL, even when reached via an old id link.
    const url = productHref(product);

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            // Child openGraph replaces the root one, so repeat the site fields.
            siteName: "Alpha Male",
            locale: "en_IN",
            type: "website",
            url,
            title,
            description,
            ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
        },
    };
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product || !product.isActive) {
        notFound();
    }

    // Old id links (and differently-cased slugs) -> permanent (308) redirect
    // to the one canonical slug URL, so search engines index a single page.
    let requested = id;
    try {
        requested = decodeURIComponent(id);
    } catch {
        // Malformed escape: keep the raw value (it simply won't match).
    }
    if (product.slug && requested !== product.slug) {
        permanentRedirect(productHref(product));
    }

    return (
        <>
            <Navbar />
            <ProductPageView product={product} />
        </>
    );
}
