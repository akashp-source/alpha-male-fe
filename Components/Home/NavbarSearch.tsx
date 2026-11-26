"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import ProductSuggestionList from "@/Components/Search/ProductSuggestionList";
import { useProductSuggestions } from "@/Components/Search/useProductSuggestions";
import { productHref } from "@/lib/productUrl";

interface NavbarSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Navbar search: icon button + panel under the navbar.
 * Typing shows matching products (click one to open it). Enter / "Search"
 * goes to /shop?search=... with the full results, from any page.
 */
export default function NavbarSearch({ open, onOpenChange }: NavbarSearchProps) {
    const router = useRouter();
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [query, setQuery] = useState("");
    const { term, suggestions, ready, loading } = useProductSuggestions(query, open);
    // Highlighted suggestion (arrow keys); only valid for the text it was set for.
    const [highlight, setHighlight] = useState({ index: -1, term: "" });
    const active = highlight.term === term ? highlight.index : -1;
    const setActive = (index: number) => setHighlight({ index, term });

    // Focus the box when it opens.
    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // Close on Escape or a click outside the panel.
    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOpenChange(false);
                buttonRef.current?.focus();
            }
        };
        const onDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) onOpenChange(false);
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open, onOpenChange]);

    const close = () => onOpenChange(false);

    // Full results on the shop page (works from the homepage and the shop itself).
    const goToResults = () => {
        close();
        router.push(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop");
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!suggestions.length) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((active + 1) % suggestions.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(active <= 0 ? suggestions.length - 1 : active - 1);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => onOpenChange(!open)}
                aria-label={open ? "Close search" : "Search products"}
                aria-expanded={open}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0e5ed] text-brand-navy transition hover:bg-[#f5f7fa] sm:h-11 sm:w-11 md:h-[46px] md:w-[46px]"
            >
                {open ? <X size={21} strokeWidth={1.8} /> : <Search size={21} strokeWidth={1.8} />}
            </button>

            {open && (
                <div ref={panelRef} className="absolute inset-x-0 top-full z-40 border-b border-[#eeeeee] bg-white shadow-lg">
                    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6">
                        <form
                            role="search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const picked = active >= 0 ? suggestions[active] : undefined;
                                if (picked) {
                                    close();
                                    router.push(productHref(picked));
                                } else {
                                    goToResults();
                                }
                            }}
                            className="flex items-center rounded-full border border-[#e0e5ed] bg-white p-1.5 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy/10"
                        >
                            <Search size={18} className="ml-3 shrink-0 text-brand-navy-muted" aria-hidden="true" />
                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                maxLength={100}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Search products, e.g. Alpha Bold"
                                aria-label="Search products"
                                aria-autocomplete="list"
                                aria-controls={listId}
                                aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                                className="min-w-0 flex-1 bg-transparent px-3 py-2 font-body text-sm text-brand-navy outline-none placeholder:text-brand-navy-muted"
                            />
                            {loading && <Loader2 size={16} className="mr-2 shrink-0 animate-spin text-brand-navy-muted" aria-hidden="true" />}
                            <button type="submit" className="rounded-full bg-brand-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-brand-navy/90">
                                Search
                            </button>
                        </form>

                        <div className="mt-3">
                            <ProductSuggestionList
                                listId={listId}
                                term={term}
                                suggestions={suggestions}
                                ready={ready}
                                loading={loading}
                                active={active}
                                onActiveChange={setActive}
                                onPick={close}
                                onSeeAll={goToResults}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
