
"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/lib/cart";

type Props = {
    productId: string;
    quantity?: number;
    className?: string;
    label?: string;
};

export default function AddToCartButton({
    productId,
    quantity = 1,
    className = "",
    label = "Add to cart",
}: Props) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState("");

    const handleAddToCart = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError("");
            setAdded(false);

            await addToCart(productId, quantity);

            setAdded(true);

            setTimeout(() => {
                setAdded(false);
            }, 1800);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={handleAddToCart}
                disabled={loading}
                className={`${className} items-center justify-between flex`}
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                    </>
                ) : added ? (
                    <>
                        <Check size={16} />
                        Added
                    </>
                ) : (
                    <>
                        <ShoppingCart size={10} />
                        {label}
                    </>
                )}
            </button>

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
