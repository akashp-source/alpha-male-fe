"use client";

import { useEffect, useState } from "react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface StoreCategory {
    _id: string;
    name: string;
    slug: string;
    productCount: number;
}

/**
 * Categories for storefront filters, from GET /categories (active only).
 * Hides categories with no active products. `slug` is the value products are
 * filtered by (GET /product?category=<slug>).
 */
export function useStoreCategories() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${API_URL}/categories`, { signal: controller.signal, cache: "no-store" })
            .then((response) => (response.ok ? response.json() : { categories: [] }))
            .then((data) => {
                const list: StoreCategory[] = Array.isArray(data.categories) ? data.categories : [];
                setCategories(list.filter((item) => item.productCount > 0));
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === "AbortError") return;
                console.error("Categories fetching error:", error);
            });
        return () => controller.abort();
    }, []);

    return categories;
}

// Moved to lib/category-label.ts (usable on the server too); re-exported here.
export { categoryLabel } from "./category-label";
