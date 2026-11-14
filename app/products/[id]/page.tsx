import { notFound } from "next/navigation";
import ProductBuySection from "@/Components/Product/ProductBuySection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function getProduct(id: string) {
    try {
        const response = await fetch(
            `${API_URL}/product/info/${id}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        return await response.json();
    } catch (error) {
        console.error("Product API Error:", error);
        throw error;
    }
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product || !product.isActive) {
        notFound();
    }

    return (
        <ProductBuySection product={product} />
    );
}