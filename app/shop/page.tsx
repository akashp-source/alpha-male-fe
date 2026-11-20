"use client";

import { useState } from "react";
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
            <ShopProducts onAddToCart={handleAddToCart} />
        </>
    );
}