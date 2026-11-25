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

// Reads ?search= (navbar search). The key remounts the list when the search
// changes, so a new navbar search on /shop starts fresh at page 1.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ShopWithSearch({ onAddToCart }: { onAddToCart: (product: any) => void }) {
    const search = (useSearchParams().get("search") ?? "").trim().slice(0, 100);
    return <ShopProducts key={search} initialSearch={search} onAddToCart={onAddToCart} />;
}