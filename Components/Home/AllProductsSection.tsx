"use client";
/* eslint-disable @typescript-eslint/no-unused-vars -- the filter area is commented out for now; remove this line when it comes back. */

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { canOptimizeImage } from "@/lib/image-hosts";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types/product";
import AddToCartButton from "@/Components/Cart/AddToCartButton";
import { categoryLabel, useStoreCategories } from "@/lib/categories";
import SortDropdown from "./SortDropdown";
import { devAuthHeader, useIsDev } from "@/lib/dev-access";
import { productHref } from "@/lib/productUrl";

// products/total: first page from the server (default filters).
type Props = { products: Product[]; total?: number };
type PriceFilter = "all" | "under500" | "500-1000" | "over1000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const PAGE_SIZE = 12;

const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function AllProductsSection({ products, total: initialTotal }: Props) {
    // Category filter options come from the backend (GET /categories).
    const categories = useStoreCategories();
    const categoryName = (slug: string) =>
        categoryLabel(categories.find((item) => item.slug === slug)?.name ?? slug.replaceAll("-", " "));
    const [apiProducts, setApiProducts] = useState(products);
    const [total, setTotal] = useState(initialTotal ?? products.length);
    // The server already sent page 1 with no filters; skip fetching it again on load.
    const skipInitialFetch = useRef(initialTotal !== undefined);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchDraft, setSearchDraft] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState<PriceFilter>("all");
    const [inStock, setInStock] = useState(false);
    const [saleOnly, setSaleOnly] = useState(false);
    const [comboOnly, setComboOnly] = useState(false);
    const [sort, setSort] = useState("featured");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    // Dev accounts also see test products (the server-sent page 1 never has them).
    const isDev = useIsDev();

    useEffect(() => {
        if (skipInitialFetch.current && !isDev) {
            skipInitialFetch.current = false;
            return;
        }
        skipInitialFetch.current = false;
        const controller = new AbortController();
        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (inStock) params.set("inStock", "true");
        if (price === "under500") params.set("maxPrice", "499");
        if (price === "500-1000") { params.set("minPrice", "500"); params.set("maxPrice", "1000"); }
        if (price === "over1000") params.set("minPrice", "1001");

        setLoading(true);
        setError("");
        fetch(`${API_URL}/product?${params.toString()}`, { signal: controller.signal, cache: "no-store", headers: devAuthHeader(isDev) })
            .then(async (response) => {
                if (!response.ok) throw new Error("Unable to load products");
                return response.json();
            })
            .then((data) => {
                setApiProducts(data.products || []);
                setTotal(data.pagination?.total ?? data.products?.length ?? 0);
            })
            .catch((err: unknown) => {
                if (err instanceof Error && err.name === "AbortError") return;
                setError("Unable to load products. Please try again.");
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [page, search, category, inStock, price, isDev]);

    const visibleProducts = useMemo(() => {
        const filtered = apiProducts.filter((product) => {
            if (saleOnly && !(product.compareAtPrice && product.compareAtPrice > product.price)) return false;
            if (comboOnly && !product.comboOffers?.length) return false;
            return true;
        });

        if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
        if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
        if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
        return filtered;
    }, [apiProducts, saleOnly, comboOnly, sort]);

    const clearFilters = () => {
        setCategory(""); setPrice("all"); setInStock(false); setSaleOnly(false); setComboOnly(false); setSearchDraft(""); setSearch(""); setPage(1);
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(1);
        setSearch(searchDraft.trim());
    };

    const updateCategory = (value: string) => { setCategory(value); setPage(1); };
    const updatePrice = (value: PriceFilter) => { setPrice(value); setPage(1); };

    return (
        <section className="bg-pale-gray px-4 py-12 text-brand-navy sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-6 text-center sm:mb-10">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-brand-navy-muted">THE ALPHA COLLECTION</p>
                    <h2 className="font-heading text-2xl font-semibold sm:text-4xl">Shop our products</h2>
                    <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">Find the right essentials for your confidence, comfort and wellbeing.</p>
                </div>

                {/* Filter area (search) - hidden for now
                <form onSubmit={submitSearch} className="mb-4 flex items-center rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy lg:hidden">
                    <Search size={18} className="ml-2 shrink-0 text-slate-500" />
                    <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search products..." aria-label="Search products" className="min-w-0 flex-1 px-2 py-2.5 text-sm text-brand-navy outline-none" />
                    <button type="submit" className="rounded-lg bg-brand-navy px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#14284d] sm:px-4 sm:text-sm">Search</button>
                </form>
                */}

                {/* <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8"> (with the filter sidebar) */}
                <div className="grid gap-5 xl:gap-8">
                    {/* Filter area (sidebar: search + filters) - hidden for now
                    <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:block">
                        {/ * Compact search for the narrow sidebar: full-width field, icon submit button * /}
                        <form onSubmit={submitSearch} role="search" className="mb-5 flex h-11 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-3.5 pr-1 transition focus-within:border-brand-navy focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy">
                            <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                            <input
                                type="search"
                                value={searchDraft}
                                onChange={(event) => setSearchDraft(event.target.value)}
                                placeholder="Search products"
                                aria-label="Search products"
                                className="h-full min-w-0 flex-1 bg-transparent px-1.5 text-sm text-brand-navy outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {searchDraft && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchDraft(""); setSearch(""); setPage(1); }}
                                    aria-label="Clear search"
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-brand-navy"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <button
                                type="submit"
                                aria-label="Search"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition hover:bg-[#14284d]"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </form>
                        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
                            <h3 className="text-lg font-semibold">Filters</h3>
                                <button type="button" onClick={clearFilters} className="text-sm underline underline-offset-2">Clear all</button>
                        </div>
                        <fieldset className="border-b border-slate-200 py-4">
                            <legend className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Category</legend>
                            <div className="space-y-3">
                                {categories.map((item) => <label key={item.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                                    <input type="checkbox" checked={category === item.slug} onChange={() => updateCategory(category === item.slug ? "" : item.slug)} className="h-4 w-4 accent-brand-navy" />{categoryLabel(item.name)}
                                </label>)}
                            </div>
                        </fieldset>
                        <fieldset className="border-b border-slate-200 py-4">
                            <legend className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Price</legend>
                            <div className="space-y-3">
                                {([["all", "Any price"], ["under500", "Under ₹500"], ["500-1000", "₹500 - ₹1,000"], ["over1000", "Over ₹1,000"]] as [PriceFilter, string][]).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-3 text-sm">
                                    <input type="radio" name="home-price" checked={price === value} onChange={() => updatePrice(value)} className="h-4 w-4 accent-brand-navy" />{label}
                                </label>)}
                            </div>
                        </fieldset>
                        <fieldset className="space-y-4 border-b border-slate-200 py-4">
                            <legend className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Availability & offers</legend>
                            <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setPage(1); }} className="h-4 w-4 accent-brand-navy" />In stock only</label>
                            <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="h-4 w-4 accent-brand-navy" />On sale only</label>
                            <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={comboOnly} onChange={(e) => setComboOnly(e.target.checked)} className="h-4 w-4 accent-brand-navy" />Combo packs</label>
                        </fieldset>
                    </aside>
                    */}

                    <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-5 sm:gap-3">
                            <div className="flex items-center gap-2">
                                {/* Mobile filters button - hidden for now
                                <button type="button" onClick={() => setMobileFiltersOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-brand-navy lg:hidden">
                                    {mobileFiltersOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
                                    {mobileFiltersOpen ? "Close" : "Filters"}
                                </button>
                                */}
                                <p className="text-xs text-slate-600 sm:text-sm">Showing <strong className="text-brand-navy">{total}</strong></p>
                            </div>
                            {/* Old sort dropdown (plain browser select)
                            <label className="flex items-center gap-2 text-xs text-slate-600 sm:gap-3 sm:text-sm">Sort
                                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-brand-navy outline-none focus:ring-2 focus:ring-brand-navy/20 sm:min-w-40 sm:px-3 sm:text-sm">
                                    <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option>
                                </select>
                            </label> */}
                            {/* Sort pill on a native select (its open list can't be styled), replaced by SortDropdown
                            {/ * Sort: pill with "SORT BY" inside and our own chevron
                                (browser arrow hidden); still a native select for
                                keyboard / screen reader / phone pickers. * /}
                            <label className="group relative flex h-10 items-center rounded-full border border-slate-300 bg-white pl-4 pr-9 shadow-sm transition hover:border-brand-navy/50 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy/15">
                                <span className="mr-2 whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">Sort by</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="h-full min-w-0 cursor-pointer appearance-none bg-transparent pr-1 font-body text-xs font-semibold text-brand-navy outline-none sm:text-sm"
                                >
                                    <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option>
                                </select>
                                <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-navy transition group-focus-within:rotate-180" />
                            </label>
                            */}
                            <SortDropdown
                                value={sort}
                                onChange={setSort}
                                options={[
                                    { value: "featured", label: "Featured" },
                                    { value: "price-low", label: "Price: low to high" },
                                    { value: "price-high", label: "Price: high to low" },
                                    { value: "name", label: "Name" },
                                ]}
                            />
                        </div>
                        {/* Mobile filters panel - hidden for now
                        {mobileFiltersOpen && <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Filter products</h3><button type="button" onClick={clearFilters} className="text-xs underline">Clear all</button></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                                <fieldset><legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</legend>{categories.map((item) => <label key={item.slug} className="mb-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={category === item.slug} onChange={() => updateCategory(category === item.slug ? "" : item.slug)} className="h-4 w-4 accent-brand-navy" />{categoryLabel(item.name)}</label>)}</fieldset>
                                <fieldset><legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Price</legend>{([["all", "Any price"], ["under500", "Under ₹500"], ["500-1000", "₹500-₹1,000"], ["over1000", "Over ₹1,000"]] as [PriceFilter, string][]).map(([value, label]) => <label key={value} className="mb-2 flex items-center gap-2 text-xs"><input type="radio" name="mobile-home-price" checked={price === value} onChange={() => updatePrice(value)} className="h-4 w-4 accent-brand-navy" />{label}</label>)}</fieldset>
                                <fieldset><legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Availability & offers</legend><label className="mb-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setPage(1); }} className="h-4 w-4 accent-brand-navy" />In stock</label><label className="mb-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="h-4 w-4 accent-brand-navy" />On sale</label><label className="mb-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={comboOnly} onChange={(e) => setComboOnly(e.target.checked)} className="h-4 w-4 accent-brand-navy" />Combo packs</label></fieldset>
                            </div>
                        </div>}
                        */}
                        {error ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-red-600">{error}</div> : loading ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white"><div className="aspect-square bg-slate-200" /><div className="space-y-3 p-3 sm:p-5"><div className="h-3 w-1/3 rounded bg-slate-200" /><div className="h-4 w-4/5 rounded bg-slate-200" /></div></div>)}</div> : visibleProducts.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {visibleProducts.map((product) => {
                                return <article key={product._id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg sm:rounded-[22px]">
                                    <div className="relative flex aspect-square items-center justify-center bg-pale-gray p-2 sm:p-5">
                                        {product.images?.[0] ? <span className="absolute inset-2 sm:inset-5"><Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 300px" className="rounded-lg object-contain" unoptimized={!canOptimizeImage(product.images[0])} /></span> : <ShoppingBag className="h-9 w-9 text-slate-400 sm:h-12 sm:w-12" />}
                                        {product.comboOffers?.length > 0 && <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-semibold sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">Combo</span>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-2.5 sm:p-5">
                                        <p className="mb-1 truncate text-[9px] font-bold uppercase tracking-[0.12em] text-brand-navy-muted sm:text-xs sm:tracking-[0.16em]">{categoryName(product.category)}</p>
                                        <Link href={productHref(product)} className="line-clamp-2 text-xs font-bold leading-4 hover:underline sm:font-heading sm:text-base sm:leading-6">{product.name}</Link>
                                        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-2 sm:gap-2"><strong className="text-sm sm:text-xl">{money(product.price)}</strong></div>
                                        <div className="mt-auto grid grid-cols-1 gap-1.5 pt-3 min-[390px]:grid-cols-2 sm:gap-2 sm:pt-4">
                                            <Link href={productHref(product)} className="flex h-9 items-center justify-center rounded-lg border border-brand-navy text-[11px] font-medium transition hover:bg-slate-50 sm:h-11 sm:rounded-xl sm:text-sm">View</Link>
                                            <AddToCartButton productId={product._id} label="Add" className="h-9 justify-center gap-1 rounded-lg bg-brand-navy px-1 text-[11px] font-medium text-white transition hover:bg-[#14284d] disabled:opacity-60 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-2 sm:text-sm" />
                                        </div>
                                    </div>
                                </article>;
                            })}
                        </div> : <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">No products match these filters.</div>}
                        {!error && total > PAGE_SIZE && <div className="mt-7 flex items-center justify-center gap-3"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="text-sm text-slate-600">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span><button type="button" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></div>}
                        <div className="mt-6 text-center sm:mt-8"><Link href="/products" className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-navy px-6 text-xs font-semibold text-white transition hover:bg-[#14284d] sm:h-12 sm:px-7 sm:text-sm">Explore all products</Link></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
