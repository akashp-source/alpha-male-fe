
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { canOptimizeImage } from "@/lib/image-hosts";
import Link from "next/link";
import { Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import AddToCartButton from "../Cart/AddToCartButton";
import { categoryLabel, useStoreCategories } from "@/lib/categories";
import { productHref } from "@/lib/productUrl";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

const LIMIT = 12;

type Product = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    category: string;
    stock: number;
    isActive: boolean;
    comboOffers?: {
        quantity: number;
        offerPrice: number;
        title?: string;
    }[];
};

type Props = {
    onAddToCart?: (product: Product) => void;
};

const priceOptions = [
    { label: "Any price", value: "all" },
    { label: "Under ₹500", value: "under500" },
    { label: "₹500 – ₹1,000", value: "500-1000" },
    { label: "Over ₹1,000", value: "over1000" },
];

const money = (value: number) =>
    `₹${value.toLocaleString("en-IN")}`;

export default function ShopProducts({ onAddToCart }: Props) {
    // Category filter options come from the backend (GET /categories).
    const storeCategories = useStoreCategories();
    const categories = useMemo(
        () => storeCategories.map((item) => ({ label: categoryLabel(item.name), value: item.slug })),
        [storeCategories],
    );
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [priceRange, setPriceRange] = useState("all");
    const [inStock, setInStock] = useState(false);
    const [saleOnly, setSaleOnly] = useState(false);
    const [comboOnly, setComboOnly] = useState(false);

    const [sortBy, setSortBy] = useState("featured");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const fetchProducts = useCallback(async (signal: AbortSignal) => {

        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
            });

            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);
            if (inStock) params.set("inStock", "true");

            if (priceRange === "under500") {
                params.set("maxPrice", "499");
            }

            if (priceRange === "500-1000") {
                params.set("minPrice", "500");
                params.set("maxPrice", "1000");
            }

            if (priceRange === "over1000") {
                params.set("minPrice", "1001");
            }

            const response = await fetch(
                `${API_URL}/product?${params.toString()}`,
                { signal, cache: "no-store" }
            );

            if (!response.ok) {
                throw new Error("Unable to fetch products");
            }

            const data = await response.json();

            setProducts(data.products || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") return;

            console.error(err);
            setError("Unable to load products. Please try again.");
        } finally {
            if (!signal.aborted) setLoading(false);
        }
    }, [page, search, category, priceRange, inStock, retry]);

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            fetchProducts(controller.signal);
        }, 350);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [fetchProducts]);

    const visibleProducts = useMemo(() => {
        let result = [...products];

        if (saleOnly) {
            result = result.filter(
                (p) => p.compareAtPrice && p.compareAtPrice > p.price
            );
        }

        if (comboOnly) {
            result = result.filter((p) => p.comboOffers?.length);
        }

        if (sortBy === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [products, saleOnly, comboOnly, sortBy]);

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setPriceRange("all");
        setInStock(false);
        setSaleOnly(false);
        setComboOnly(false);
        setPage(1);
    };

    const changeFilter = (callback: () => void) => {
        callback();
        setPage(1);
    };

    const discount = (product: Product) => {
        if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
            return 0;
        }

        return Math.round(
            ((product.compareAtPrice - product.price) /
                product.compareAtPrice) * 100
        );
    };

    const FilterPanel = (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-brand-navy">
                    Filters
                </h3>

                <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-brand-navy underline"
                >
                    Clear all
                </button>
            </div>

            <div className="border-t border-slate-200 py-4">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Category
                </h4>

                <div className="space-y-3">
                    {categories.map((item) => (
                        <label
                            key={item.value}
                            className="flex cursor-pointer items-center gap-3 text-sm text-brand-navy"
                        >
                            <input
                                type="checkbox"
                                checked={category === item.value}
                                onChange={() =>
                                    changeFilter(() =>
                                        setCategory(
                                            category === item.value
                                                ? ""
                                                : item.value
                                        )
                                    )
                                }
                                className="h-4 w-4 accent-brand-navy"
                            />
                            <span className="flex-1">{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-200 py-4">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Price
                </h4>

                <div className="space-y-3">
                    {priceOptions.map((item) => (
                        <label
                            key={item.value}
                            className="flex cursor-pointer items-center gap-3 text-sm text-brand-navy"
                        >
                            <input
                                type="radio"
                                name="price"
                                checked={priceRange === item.value}
                                onChange={() =>
                                    changeFilter(() =>
                                        setPriceRange(item.value)
                                    )
                                }
                                className="h-4 w-4 accent-brand-navy"
                            />
                            {item.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-200 py-4">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Availability
                </h4>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-brand-navy">
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) =>
                            changeFilter(() => setInStock(e.target.checked))
                        }
                        className="h-4 w-4 accent-brand-navy"
                    />
                    In stock only
                </label>
            </div>

            <div className="border-t border-slate-200 py-4">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Offers
                </h4>

                <div className="space-y-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-brand-navy">
                        <input
                            type="checkbox"
                            checked={saleOnly}
                            onChange={(e) => setSaleOnly(e.target.checked)}
                            className="h-4 w-4 accent-brand-navy"
                        />
                        On sale only
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 text-sm text-brand-navy">
                        <input
                            type="checkbox"
                            checked={comboOnly}
                            onChange={(e) => setComboOnly(e.target.checked)}
                            className="h-4 w-4 accent-brand-navy"
                        />
                        Combo packs
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-pale-gray">
            {/* Shop header */}
            <section className="bg-brand-navy px-5 py-8 text-white md:px-8 md:py-10">
                <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                    <div>
                        <p className="mb-3 text-sm text-slate-300">
                            <Link href="/">Home</Link>
                            <span className="mx-2">›</span>
                            Shop
                        </p>

                        <h1 className="font-heading text-3xl font-semibold uppercase md:text-4xl">
                            Shop All Products
                        </h1>

                        <p className="mt-2 text-sm text-slate-300 md:text-base">
                            Condoms, lubricants and oral strips, delivered discreetly.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        className="flex w-full max-w-md items-center rounded-full bg-white p-1.5 text-brand-navy focus-within:ring-2 focus-within:ring-[#e9b949] focus-within:ring-offset-2 focus-within:ring-offset-brand-navy"
                    >
                        <Search size={18} className="ml-3 shrink-0 text-slate-500" />

                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search products..."
                            aria-label="Search products"
                            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                        />

                        <button className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14284d]">
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Main content */}
            <section className="mx-auto max-w-[1320px] px-4 py-7 md:px-6 lg:px-8 lg:py-9">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                    {/* Desktop sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-5">
                            {FilterPanel}
                        </div>
                    </aside>

                    {/* Products */}
                    <div className="min-w-0">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-brand-navy lg:hidden"
                                >
                                    <SlidersHorizontal size={16} />
                                    Filters
                                </button>

                                <p className="text-sm text-slate-600">
                                    Showing{" "}
                                    <strong className="text-brand-navy">
                                        {total}
                                    </strong>{" "}
                                    products
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="hidden text-sm text-slate-500 sm:block">
                                    Sort by
                                </span>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-brand-navy outline-none"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse overflow-hidden rounded-2xl bg-white"
                                    >
                                        <div className="aspect-square bg-slate-200" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-3 w-1/3 rounded bg-slate-200" />
                                            <div className="h-4 w-4/5 rounded bg-slate-200" />
                                            <div className="h-5 w-1/2 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl bg-white p-10 text-center">
                                <p className="text-sm text-red-600">{error}</p>
                                <button
                                    onClick={() => setRetry((v) => v + 1)}
                                    className="mt-4 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : visibleProducts.length === 0 ? (
                            <div className="rounded-2xl bg-white p-12 text-center">
                                <h3 className="font-semibold text-brand-navy">
                                    No products found
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try changing your search or filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm font-semibold underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                                {visibleProducts.map((product) => {
                                    const sale = discount(product);
                                    const image = product.images?.[0];

                                    return (
                                        <article
                                            key={product._id}
                                            className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {sale > 0 && (
                                                <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-navy px-2.5 py-1 text-[10px] font-bold text-white md:text-xs">
                                                    {sale}% OFF
                                                </span>
                                            )}

                                            {!!product.comboOffers?.length && (
                                                <span className="absolute right-3 top-3 z-10 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-brand-navy md:text-xs">
                                                    Combo
                                                </span>
                                            )}

                                            {/* Fixed image area */}
                                            <Link
                                                href={productHref(product)}
                                                className="relative block aspect-square overflow-hidden bg-pale-gray p-4"
                                            >
                                                {image ? (
                                                    <Image
                                                        src={image}
                                                        alt={product.name}
                                                        fill
                                                        unoptimized={!canOptimizeImage(image)}
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
                                                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                        Product image unavailable
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Details */}
                                            <div className="p-3 md:p-4">
                                                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:text-xs">
                                                    {product.category}
                                                </p>

                                                <Link href={productHref(product)}>
                                                    <h3 className="min-h-10 text-xs font-semibold leading-snug text-brand-navy hover:text-success-green md:min-h-12 md:text-sm">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="text-base font-extrabold text-brand-navy md:text-lg">
                                                        {money(product.price)}
                                                    </span>

                                                    {product.compareAtPrice &&
                                                        product.compareAtPrice > product.price && (
                                                            <span className="text-[10px] text-slate-400 line-through md:text-xs">
                                                                {money(product.compareAtPrice)}
                                                            </span>
                                                        )}
                                                </div>

                                                <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                                                    <Link
                                                        href={productHref(product)}
                                                        className="flex w-full min-h-10 items-center justify-center rounded-xl border border-brand-navy
        bg-white px-3 py-2 text-sm font-semibold text-brand-navy
        whitespace-nowrap transition hover:bg-slate-100"
                                                    >
                                                        View
                                                    </Link>

                                                    {/* <button
                                                        // onClick={() => handleAddToCart(product)}
                                                        disabled={!product.stock || product.stock <= 0}
                                                        className="w-full min-h-10 rounded-xl bg-brand-navy 
        px-3 py-2 text-sm font-semibold text-white
        whitespace-nowrap transition hover:bg-[#142747]
        disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {product.stock > 0 ? "Add to cart 8" : "Out of stock"}
                                                    </button> */}

                                                    <AddToCartButton
                                                        productId={product._id}
                                                        className="w-full min-h-10 rounded-xl bg-brand-navy 
        px-3 py-2 text-sm font-semibold text-white
        whitespace-nowrap transition hover:bg-[#14284d]
        disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => setPage(number)}
                                        className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold ${page === number
                                            ? "bg-brand-navy text-white"
                                            : "border bg-white text-brand-navy"
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Mobile filters */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <button
                        aria-label="Close filters"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="absolute inset-0 bg-black/50"
                    />

                    <div className="absolute bottom-0 left-0 top-0 w-[min(85%,340px)] overflow-y-auto bg-pale-gray p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-brand-navy">
                                Product filters
                            </h2>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="rounded-full bg-white p-2"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {FilterPanel}

                        <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="mt-4 w-full rounded-lg bg-brand-navy py-3 font-bold text-white"
                        >
                            Show products
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
