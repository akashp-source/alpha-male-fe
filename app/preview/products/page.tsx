import type { Metadata } from "next";

import Navbar from "@/Components/Home/NavBar";
import ProductPageView from "@/Components/Product/ProductPageView";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// Admin-only preview of a product page (works for unpublished products).
// Never index it, and never send the tokenised URL to other sites.
export const metadata: Metadata = {
    title: "Product preview | Alpha Male",
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
};

type PreviewResult =
    | { ok: true; product: any } // eslint-disable-line @typescript-eslint/no-explicit-any
    | { ok: false; message: string };

async function getPreview(token: string): Promise<PreviewResult> {
    if (!token) {
        return { ok: false, message: "This preview link is missing its access code." };
    }

    try {
        // The token is sent as a header (not in the API URL) and verified by the backend.
        const response = await fetch(`${API_URL}/product/preview`, {
            headers: { "x-preview-token": token },
            cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
            return {
                ok: false,
                message: "This preview link is invalid or has expired. Open a new preview from the admin panel.",
            };
        }
        if (response.status === 404) {
            return { ok: false, message: "This product no longer exists." };
        }
        if (!response.ok) {
            return { ok: false, message: "The preview could not be loaded. Try again in a moment." };
        }

        return { ok: true, product: await response.json() };
    } catch (error) {
        console.error("Product preview error:", error);
        return { ok: false, message: "The preview could not be loaded. Try again in a moment." };
    }
}

export default async function ProductPreviewPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { token } = await searchParams;
    const result = await getPreview(typeof token === "string" ? token : "");

    if (!result.ok) {
        return (
            <>
                <Navbar />
                <main className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-white px-6 text-center text-brand-navy">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-palladium">Admin preview</p>
                    <h1 className="mt-3 font-heading text-2xl font-semibold">Preview unavailable</h1>
                    <p className="mt-3 max-w-md font-body text-sm">{result.message}</p>
                </main>
            </>
        );
    }

    const product = result.product;

    return (
        <>
            {/* Preview notice, above the regular site header */}
            <div
                role="status"
                className="sticky top-0 z-[60] w-full bg-brand-navy px-4 py-2.5 text-center font-body text-xs text-white sm:text-sm"
            >
                <strong className="font-semibold uppercase tracking-[0.15em]">Admin preview</strong>
                <span className="mx-2 text-palladium">·</span>
                {product.isActive
                    ? "This product is live. This is how customers see it."
                    : "Not published — customers can't see this page. Buying is disabled until the product is active."}
            </div>

            <Navbar />
            <ProductPageView product={product} />
        </>
    );
}
