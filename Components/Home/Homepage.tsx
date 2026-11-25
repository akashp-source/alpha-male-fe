
import Navbar from "./NavBar";
import HeroBanner from "./Banner";
import type { Product } from "@/types/product";
import AllProductsSection from "./AllProductsSection";
import BestSellers from "./BestSellers";
import FeaturedProducts from "./FeaturedProducts";
import FAQ from "../Faqs";
import TrustSection from "./TrustSection";
// import FooterPage from "../Footer"; (replaced by FooterV2 in app/layout.tsx)
import ImageComparison from "./ImageComparison";
import BrandValues from "./BrandValues";
import DeliveryBanner from "../DeliveryBanner";
import OurStandard from "../OurStandard";
import { productFetchOptions } from "@/lib/product-cache";
import { toFeaturedProducts, type FeaturedProduct } from "@/lib/featured-products";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// First page of "All products" only: the section pages and filters itself
// in the browser, so loading every product here was wasted work.
// Must match AllProductsSection's PAGE_SIZE.
const ALL_PRODUCTS_PAGE_SIZE = 12;

async function getProducts(): Promise<{ products: Product[]; total: number }> {
    try {
        const response = await fetch(
            `${API_URL}/product?page=1&limit=${ALL_PRODUCTS_PAGE_SIZE}`,
            productFetchOptions,
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const products: Product[] = data.products || [];
        return { products, total: data.pagination?.total ?? products.length };
    } catch (error) {
        console.error("Product fetching error:", error);
        return { products: [], total: 0 };
    }
}

// Featured slider, fetched here so it renders with the page (null = let the
// slider fetch in the browser as before).
async function getFeaturedProducts(): Promise<FeaturedProduct[] | null> {
    try {
        const response = await fetch(`${API_URL}/product/hero`, productFetchOptions);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return toFeaturedProducts(await response.json());
    } catch (error) {
        console.error("Featured products error:", error);
        return null;
    }
}

// Best sellers strip; an error just hides the section.
async function getBestSellers(): Promise<Product[]> {
    try {
        const response = await fetch(`${API_URL}/product/best-sellers`, productFetchOptions);
        if (!response.ok) throw new Error("Failed to fetch best sellers");
        const data = await response.json();
        return Array.isArray(data.products) ? data.products : [];
    } catch (error) {
        console.error("Best sellers fetching error:", error);
        return [];
    }
}

type HomeComparisonSide = { productId: string; image: string; label: string; href: string };
type HomeComparison = {
    _id: string;
    title: string;
    description: string;
    left: HomeComparisonSide;
    right: HomeComparisonSide;
};

// "Find Your Alpha" blocks (home_comparisons collection). The backend only
// returns blocks whose two products are active; an error hides the section.
async function getHomeComparisons(): Promise<HomeComparison[]> {
    try {
        const response = await fetch(`${API_URL}/home-comparisons`, {
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch comparisons");
        const data = await response.json();
        return Array.isArray(data.comparisons) ? data.comparisons : [];
    } catch (error) {
        console.error("Home comparisons fetching error:", error);
        return [];
    }
}

export default async function HomePage() {
    const [{ products, total }, bestSellers, comparisons, featured] = await Promise.all([
        getProducts(),
        getBestSellers(),
        getHomeComparisons(),
        getFeaturedProducts(),
    ]);

    return (
        <>
            <Navbar />
            <HeroBanner />
            <BestSellers products={bestSellers} />
            <AllProductsSection products={products} total={total} />
            <h2 className="font-heading font-semibold text-center text-4xl p-5">
                Our Featured Products
            </h2>
            <FeaturedProducts initialProducts={featured} />
            <TrustSection />
            {/* "Our standard" badges, sliding */}
            <OurStandard marquee />
            {comparisons.map((comparison) => (
                <ImageComparison
                    key={comparison._id}
                    leftImage={comparison.left.image}
                    rightImage={comparison.right.image}
                    leftLabel={comparison.left.label}
                    rightLabel={comparison.right.label}
                    leftHref={comparison.left.href}
                    rightHref={comparison.right.href}
                    title={comparison.title}
                    description={comparison.description || undefined}
                />
            ))}
            <BrandValues />
            {/* Discreet delivery banner (sliding packaging photos) */}
            <DeliveryBanner showShopButton />
            {/* White gap so the navy banner doesn't run into the dark FAQ */}
            <div aria-hidden="true" className="h-12 w-full bg-white sm:h-16" />
            <FAQ />
            {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}
        </>
    );
}
