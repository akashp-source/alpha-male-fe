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

/** Display form of a category name: first letter of each word capitalised ("oral strip" -> "Oral Strip"). */
export function categoryLabel(name: string) {
    return String(name ?? "")
        .trim()
        .replace(/(^|[\s/-])([a-z])/g, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}
