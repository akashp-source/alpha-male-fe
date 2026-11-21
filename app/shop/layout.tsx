import type { Metadata } from "next";

// app/shop/page.tsx is a client component and can't export metadata,
// so the shop's title and description live in this pass-through layout.
export const metadata: Metadata = {
    title: "Shop All Products",
    description:
        "Browse the full Alpha Male range of men's sexual wellness products. Genuine products, plain packaging and discreet delivery across India.",
};

export default function ShopLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return children;
}
