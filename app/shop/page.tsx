"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import ShopProducts from "@/Components/Shop/ShopProducts";
import Navbar from "@/Components/Home/NavBar";

type CartItem = {
    _id: string;
    name: string;
    price: number;
    quantity: number;
};

export default function ShopPage() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const handleAddToCart = (product: any) => {
        setCart((previousCart) => {
            const existing = previousCart.find(
                (item) => item._id === product._id
            );

            if (existing) {
                return previousCart.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...previousCart,
                {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                },
            ];
        });

        alert(`${product.name} added to cart!`);
    };

    return (
        <>
            <Navbar />
            {/* useSearchParams needs a Suspense boundary */}
            <Suspense fallback={null}>
                <ShopWithSearch onAddToCart={handleAddToCart} />
            </Suspense>
        </>
    );
}

// Reads ?search= (navbar search) and ?category= (homepage "Browse by
// category"). The key remounts the list when either changes, so it starts
// fresh at page 1.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ShopWithSearch({ onAddToCart }: { onAddToCart: (product: any) => void }) {
    const params = useSearchParams();
    const search = (params.get("search") ?? "").trim().slice(0, 100);
    const rawCategory = (params.get("category") ?? "").trim().toLowerCase();
    // Only a slug ("oral-strips"); anything else is ignored.
    const category = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawCategory) && rawCategory.length <= 100 ? rawCategory : "";
    return <ShopProducts key={`${search}|${category}`} initialSearch={search} initialCategory={category} onAddToCart={onAddToCart} />;
}