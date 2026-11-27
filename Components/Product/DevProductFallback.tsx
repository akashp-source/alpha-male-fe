"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navbar from "@/Components/Home/NavBar";
import ProductPageView from "@/Components/Product/ProductPageView";
import { devAuthHeader, useIsDev } from "@/lib/dev-access";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/**
 * Product URL that wasn't found for the (shared, cached) page. Test products
 * are hidden from that page; a "dev" account loads it here with its login.
 * Everyone else sees `children` (the normal 404).
 */
export default function DevProductFallback({ children }: { children: ReactNode }) {
    const isDev = useIsDev();
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (!isDev) return;
        const idOrSlug = pathname?.split("/").filter(Boolean)[1];
        if (!idOrSlug) return;
        const controller = new AbortController();
        fetch(`${API_URL}/product/info/${encodeURIComponent(decodeURIComponent(idOrSlug))}`, {
            headers: devAuthHeader(),
            cache: "no-store",
            signal: controller.signal,
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data?._id && data.isActive) setProduct(data);
            })
            .catch(() => {
                // Not found / offline: keep the 404.
            });
        return () => controller.abort();
    }, [isDev, pathname]);

    if (!product) return <>{children}</>;

    return (
        <>
            <Navbar />
            {product.isTest && (
                <p className="w-full bg-amber-100 px-4 py-2 text-center font-body text-xs font-semibold text-amber-900">
                    Test product: only dev accounts can see this page.
                </p>
            )}
            <ProductPageView product={product} />
        </>
    );
}
