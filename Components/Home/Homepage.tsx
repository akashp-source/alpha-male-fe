
import Navbar from "./NavBar";
import HeroBanner from "./Banner";
import ProductShowcase from "./ProductShowcase";
import type { Product } from "@/types/product";
import FeaturedProducts from "./FeaturedProducts";
import FAQ from "../Faqs";
import TrustSection from "./TrustSection";
import FooterPage from "../Footer";
import ImageComparison from "./ImageComparison";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function getProducts(): Promise<Product[]> {
    try {
        const response = await fetch(
            `${API_URL}/product?page=1&limit=12`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        return data.products || [];
    } catch (error) {
        console.error("Product fetching error:", error);
        return [];
    }
}

export default async function HomePage() {
    const products = await getProducts();

    return (
        <>
            <Navbar />
            <HeroBanner />
            <ProductShowcase products={products} />
            <h1 className="font-heading font-semibold text-center text-4xl p-5">
                Our Featured Products
            </h1>
            <FeaturedProducts />
            <TrustSection />
            <ImageComparison
                leftImage="/images/comparison/alpha-bold.png"
                rightImage="/images/comparison/alpha-boss.png"
                leftLabel="Alpha Bold"
                rightLabel="Alpha Boss"
                leftHref="/products/PRODUCT_ID_1"
                rightHref="/products/PRODUCT_ID_2"
                title="Find Your Alpha"
                description="Explore the Alpha Male collection."
            />
            <FAQ />
            <FooterPage />
        </>
    );
}
