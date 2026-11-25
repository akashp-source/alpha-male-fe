"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
export const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 250;

export type ProductSuggestion = {
    _id: string;
    slug?: string;
    name: string;
    price: number;
    images?: string[];
};

/**
 * Products matching `query`, fetched a moment after typing stops (used by the
 * navbar search and the shop search bar). `ready` is true once the results
 * shown belong to the current text.
 */
export function useProductSuggestions(query: string, enabled: boolean) {
    const term = query.trim();
    const [results, setResults] = useState<ProductSuggestion[]>([]);
    const [resultsFor, setResultsFor] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled || !term) return;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page: "1", limit: String(MAX_SUGGESTIONS), search: term });
                const response = await fetch(`${API_URL}/product?${params.toString()}`, { signal: controller.signal });
                if (!response.ok) throw new Error("search failed");
                const data = await response.json();
                setResults(Array.isArray(data.products) ? data.products.slice(0, MAX_SUGGESTIONS) : []);
                setResultsFor(term);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    setResults([]);
                    setResultsFor(term);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, DEBOUNCE_MS);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [enabled, term]);

    const ready = Boolean(term) && resultsFor === term;
    return { term, suggestions: ready ? results : [], ready, loading };
}
