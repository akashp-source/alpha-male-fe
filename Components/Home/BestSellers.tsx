import Link from "next/link";
import { ArrowUpRight, Flame, ShoppingBag } from "lucide-react";

import type { Product } from "@/types/product";

type BestSellerProduct = Pick<
    Product,
    "_id" | "name" | "price" | "images" | "category" | "stock"
>;

interface BestSellersProps {
    products: BestSellerProduct[];
}

// Desktop switches from a static row to an auto-scrolling marquee above this.
const MARQUEE_MIN = 5;

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function BestSellerCard({
    product,
    hidden = false,
}: {
    product: BestSellerProduct;
    /** Duplicate copy used only to make the marquee loop seamlessly. */
    hidden?: boolean;
}) {
    const image = product.images?.[0];
    return (
        <Link
            href={`/products/${product._id}`}
            aria-hidden={hidden || undefined}
            tabIndex={hidden ? -1 : undefined}
            className="group block h-full rounded-2xl border border-[#eee7de] bg-white p-2.5 shadow-[0_8px_30px_rgba(33,27,23,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(33,27,23,0.12)] sm:p-3"
        >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f3ede5]">
                {image ? (
                    <img
                        src={image}
                        alt={hidden ? "" : product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ShoppingBag size={36} className="text-[#b5a99b]" />
                    </div>
                )}

                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#211b17] px-2.5 py-1 font-body text-xs font-bold uppercase tracking-wider text-[#f0c65b]">
                    <Flame size={11} />
                    Best seller
                </span>

            </div>

            <div className="px-1 pb-1 pt-3">
                <h3 className="line-clamp-2 min-h-10 font-heading text-sm font-bold leading-5 text-[#211b17] transition-colors group-hover:text-[#176348] sm:text-base">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-body text-sm font-bold text-[#211b17] sm:text-base">
                            {money(product.price)}
                        </span>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3ede5] text-[#211b17] transition-colors group-hover:bg-[#071630] group-hover:text-white">
                        <ArrowUpRight size={15} />
                    </span>
                </div>

                {product.stock <= 0 && (
                    <p className="mt-1.5 font-body text-xs font-semibold text-red-600">Out of stock</p>
                )}
            </div>
        </Link>
    );
}

export default function BestSellers({ products }: BestSellersProps) {
    if (!products.length) return null;

    const useMarquee = products.length >= MARQUEE_MIN;
    // ~5s per card keeps the speed similar whatever the count.
    const duration = `${Math.max(products.length * 5, 25)}s`;

    return (
        <section className="w-full bg-white px-3 py-10 sm:px-6 sm:py-14 lg:px-10" aria-labelledby="best-sellers-heading">
            <div className="mx-auto max-w-[1450px]">
                <div className="mb-6 flex flex-col items-center text-center sm:mb-10">
                    <p className="mb-2 inline-flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-[0.3em] text-[#176348]">
                        <Flame size={13} className="text-[#c28a29]" />
                        Most loved
                    </p>
                    <h2 id="best-sellers-heading" className="font-heading text-2xl font-bold text-[#211b17] sm:text-4xl">
                        Best Sellers
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl font-body text-xs leading-6 text-[#8b8077] sm:text-sm">
                        The products men come back for again and again.
                    </p>
                </div>

                {/* Mobile: swipeable, snapping row */}
                <div className="-mx-3 md:hidden">
                    <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-3 px-3 pb-3">
                        {products.map((product) => (
                            <li key={product._id} className="w-[68%] max-w-[260px] shrink-0 snap-start">
                                <BestSellerCard product={product} />
                            </li>
                        ))}
                    </ul>
                    {products.length > 1 && (
                        <p className="mt-1 text-center font-body text-xs uppercase tracking-[0.2em] text-[#5c534b]">
                            Swipe to see more →
                        </p>
                    )}
                </div>

                {/* Desktop */}
                {useMarquee ? (
                    <div className="bestseller-marquee-wrap hidden md:block">
                        <ul
                            className="bestseller-marquee flex w-max"
                            style={{ "--marquee-duration": duration } as React.CSSProperties}
                        >
                            {[...products, ...products].map((product, index) => {
                                const duplicate = index >= products.length;
                                return (
                                    <li
                                        key={`${product._id}-${index}`}
                                        data-duplicate={duplicate || undefined}
                                        aria-hidden={duplicate || undefined}
                                        className="w-[250px] shrink-0 pr-5 lg:w-[280px] lg:pr-6"
                                    >
                                        <BestSellerCard product={product} hidden={duplicate} />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <ul className="hidden flex-wrap justify-center gap-5 md:flex lg:gap-6">
                        {products.map((product) => (
                            <li key={product._id} className="w-[250px] lg:w-[280px]">
                                <BestSellerCard product={product} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
