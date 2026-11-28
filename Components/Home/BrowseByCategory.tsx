import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { canOptimizeImage } from "@/lib/image-hosts";
import { categoryLabel } from "@/lib/category-label";

/** Category for the homepage cards (GET /categories, active only). */
export interface BrowseCategory {
    _id: string;
    name: string;
    slug: string;
    /** Card heading (admin → Categories → Card title); blank = the name. */
    title?: string;
    /** Short line under the heading (admin → Categories → Card tagline). */
    tagline?: string;
    /** Wide 3:1 image (admin → Categories → Banner image). */
    bannerImage?: string;
    image?: string;
    portraitImage?: string;
    productCount: number;
}

/**
 * Homepage "Browse by category": one wide card per category that has products,
 * in the admin's category order. Each card opens the shop filtered to it.
 */
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Keeps only usable categories (id, name and slug present, at least one
 * product) and fills missing fields, so bad or partial API data never breaks
 * the homepage.
 */
function usableCategories(categories: unknown): BrowseCategory[] {
    if (!Array.isArray(categories)) return [];
    return categories.flatMap((raw) => {
        if (!raw || typeof raw !== "object") return [];
        const item = raw as Record<string, unknown>;
        const id = text(item._id) || (item._id ? String(item._id) : "");
        const name = text(item.name);
        const slug = text(item.slug);
        const productCount = Number(item.productCount);
        if (!id || !name || !slug || !Number.isFinite(productCount) || productCount <= 0) return [];
        return [{
            _id: id,
            name,
            slug,
            title: text(item.title),
            tagline: text(item.tagline),
            bannerImage: text(item.bannerImage),
            image: text(item.image),
            portraitImage: text(item.portraitImage),
            productCount: Math.floor(productCount),
        }];
    });
}

export default function BrowseByCategory({ categories }: { categories?: BrowseCategory[] | null }) {
    const shown = usableCategories(categories);
    if (!shown.length) return null;

    return (
        <section aria-labelledby="browse-by-category" className="w-full bg-white px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-7 text-center sm:mb-9">
                    <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-navy-muted sm:text-xs">
                        Shop by need
                    </p>
                    <h2 id="browse-by-category" className="text-3xl text-brand-navy sm:text-4xl">
                        Browse by category
                    </h2>
                </div>

                <div className={`grid gap-4 sm:gap-6 ${shown.length > 1 ? "lg:grid-cols-2" : ""}`}>
                    {shown.map((category) => {
                        const image = category.bannerImage || category.image || category.portraitImage || "";
                        const title = category.title || categoryLabel(category.name);
                        return (
                            <Link
                                key={category._id}
                                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                                className="group relative isolate block aspect-[2/1] overflow-hidden rounded-2xl bg-brand-navy shadow-[0_14px_34px_rgba(33,46,73,0.14)] outline-none transition duration-300 hover:shadow-[0_20px_44px_rgba(33,46,73,0.22)] focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:aspect-[3/1]"
                            >
                                {image && (
                                    <Image
                                        src={image}
                                        alt=""
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        unoptimized={!canOptimizeImage(image)}
                                        className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                    />
                                )}
                                {/* Black film over the whole photo (lifts a little on hover). */}
                                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-black/45 transition-colors duration-500 group-hover:bg-black/30 motion-reduce:transition-none" />
                                {/* Soft vignette: darker at the edges, like a dimmed screen. */}
                                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
                                {/* Dark fade on the text side so white text stays readable on any photo. */}
                                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

                                <span className="flex h-full max-w-[75%] flex-col justify-center p-5 text-white sm:max-w-[60%] sm:p-7 lg:p-8">
                                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs">
                                        {category.productCount} {category.productCount === 1 ? "product" : "products"}
                                    </span>
                                    <span className="mt-1.5 font-heading text-2xl leading-tight text-white sm:text-3xl">{title}</span>
                                    {category.tagline && (
                                        <span className="mt-1.5 line-clamp-2 font-body text-xs leading-relaxed text-white/85 sm:text-sm">
                                            {category.tagline}
                                        </span>
                                    )}
                                    <span className="mt-3 inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-white sm:mt-4 sm:text-sm">
                                        Shop now
                                        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
