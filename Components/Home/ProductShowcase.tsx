
import Link from "next/link";
import type { Product } from "@/types/product";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

interface ProductShowcaseProps {
    products: Product[];
}

export default function ProductShowcase({
    products,
}: ProductShowcaseProps) {
    return (
        <section className="bg-[#faf7f2] px-3 py-10 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div className="mx-auto max-w-[1450px]">

                {/* Section Heading */}
                <div className="mb-7 text-center sm:mb-12">
                    <p className="mb-2 font-body text-[9px] font-bold uppercase tracking-[0.3em] text-[#176348] sm:mb-3 sm:text-xs">
                        THE ALPHA COLLECTION
                    </p>

                    <h2 className="font-heading text-2xl font-bold text-[#211b17] sm:text-4xl lg:text-[46px]">
                        Our Products
                    </h2>

                    <p className="mx-auto mt-2 max-w-2xl font-body text-xs leading-6 text-[#8b8077] sm:mt-4 sm:text-base sm:leading-7">
                        Discover the Alpha Male collection. Crafted for
                        confidence, quality and performance. Find what
                        works for you.
                    </p>
                </div>

                {/* Product Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">

                        {products.map((product) => {
                            const image = product.images?.[0];

                            const discount =
                                product.compareAtPrice &&
                                    product.compareAtPrice > product.price
                                    ? Math.round(
                                        ((product.compareAtPrice -
                                            product.price) /
                                            product.compareAtPrice) *
                                        100
                                    )
                                    : 0;

                            return (
                                <Link
                                    href={`/products/${product._id}`}
                                    key={product._id}
                                    className="group block min-w-0"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eee7de] sm:aspect-[4/4.3] sm:rounded-xl">

                                        {image ? (
                                            <img
                                                src={image}
                                                alt={product.name}
                                                loading="lazy"
                                                className="h-full w-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-110 sm:p-5"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <ShoppingBag
                                                    size={32}
                                                    className="text-[#b5a99b] sm:h-12 sm:w-12"
                                                />
                                            </div>
                                        )}

                                        {/* Category */}
                                        <span className="absolute left-1.5 top-1.5 max-w-[75%] truncate rounded-full bg-white/90 px-2 py-1 font-body text-[7px] font-bold uppercase tracking-wider text-[#176348] backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[9px]">
                                            {product.category}
                                        </span>

                                        {/* Discount */}
                                        {discount > 0 && (
                                            <span className="absolute right-1.5 top-1.5 rounded-full bg-[#176348] px-1.5 py-1 font-body text-[7px] font-bold text-white sm:right-3 sm:top-3 sm:px-3 sm:text-[10px]">
                                                {discount}% OFF
                                            </span>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 flex items-end justify-center bg-[#17120f]/0 p-2 transition-all duration-500 group-hover:bg-[#17120f]/25 sm:p-4">

                                            <div className="w-full translate-y-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                                <div className="flex h-9 items-center justify-center gap-1 rounded-md bg-[#176348] font-body text-[10px] font-semibold text-white shadow-lg sm:h-12 sm:gap-2 sm:rounded-lg sm:text-sm">
                                                    View Product
                                                    <ArrowUpRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="pt-2.5 sm:pt-4">

                                        <div className="flex items-start justify-between gap-1">
                                            <h3 className="line-clamp-2 font-heading text-xs font-bold leading-5 text-[#211b17] transition-colors duration-300 group-hover:text-[#176348] sm:text-lg sm:leading-normal">
                                                {product.name}
                                            </h3>

                                            <ArrowUpRight
                                                size={14}
                                                className="mt-0.5 hidden shrink-0 text-[#a99b8c] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:block"
                                            />
                                        </div>

                                        <p className="mt-1 line-clamp-2 min-h-8 font-body text-[9px] leading-4 text-[#91857b] sm:min-h-10 sm:text-xs sm:leading-5">
                                            {product.description}
                                        </p>

                                        {/* Price */}
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                                            <span className="font-body text-sm font-bold text-[#211b17] sm:text-base">
                                                ₹{product.price.toLocaleString("en-IN")}
                                            </span>

                                            {product.compareAtPrice &&
                                                product.compareAtPrice > product.price && (
                                                    <span className="font-body text-[9px] text-[#a69a90] line-through sm:text-xs">
                                                        ₹{product.compareAtPrice.toLocaleString("en-IN")}
                                                    </span>
                                                )}
                                        </div>

                                        {/* Stock */}
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${product.stock > 0
                                                        ? "bg-[#176348]"
                                                        : "bg-red-500"
                                                    }`}
                                            />

                                            <span className="font-body text-[9px] text-[#91857b] sm:text-[10px]">
                                                {product.stock > 0
                                                    ? "Available"
                                                    : "Out of stock"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <p className="font-body text-sm text-[#91857b]">
                            No products available currently.
                        </p>
                    </div>
                )}

                {/* View All */}
                <div className="mt-9 text-center sm:mt-12">
                    <Link
                        href="/products"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#211b17] px-5 font-body text-[10px] font-bold uppercase tracking-[0.12em] text-[#211b17] transition-all duration-300 hover:border-[#176348] hover:bg-[#176348] hover:text-white sm:h-12 sm:gap-3 sm:px-8 sm:text-xs sm:tracking-[0.15em]"
                    >
                        Explore All Products
                        <ArrowUpRight size={15} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
