
import Navbar from "./NavBar";
import HeroBanner from "./Banner";
import type { Product } from "@/types/product";
import AllProductsSection from "./AllProductsSection";
import BestSellers from "./BestSellers";
import FeaturedProducts from "./FeaturedProducts";
import FAQ from "../Faqs";
import TrustSection from "./TrustSection";
import FooterPage from "../Footer";
import ImageComparison from "./ImageComparison";
import BrandValues from "./BrandValues";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function getProducts(): Promise<Product[]> {
    try {
        const products: Product[] = [];
        let page = 1;
        let totalPages = 1;

        do {
            const response = await fetch(
                `${API_URL}/product?page=${page}&limit=100`,
                { cache: "no-store" }
            );

            if (!response.ok) throw new Error("Failed to fetch products");

            const data = await response.json();
            products.push(...(data.products || []));
            totalPages = data.pagination?.totalPages || 1;
            page += 1;
        } while (page <= totalPages);

        return products;
    } catch (error) {
        console.error("Product fetching error:", error);
        return [];
    }
}

// Best sellers strip; an error just hides the section.
async function getBestSellers(): Promise<Product[]> {
    try {
        const response = await fetch(`${API_URL}/product/best-sellers`, {
            cache: "no-store",
        });
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
    const [products, bestSellers, comparisons] = await Promise.all([
        getProducts(),
        getBestSellers(),
        getHomeComparisons(),
    ]);

    return (
        <>
            <Navbar />
            <HeroBanner />
            <BestSellers products={bestSellers} />
            <AllProductsSection products={products} />
            <h1 className="font-heading font-semibold text-center text-4xl p-5">
                Our Featured Products
            </h1>
            <FeaturedProducts />
            <TrustSection />
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
            <FAQ />
            <FooterPage />
        </>
    );
}
