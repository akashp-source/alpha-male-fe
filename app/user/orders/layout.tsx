import type { Metadata } from "next";

// Neutral tab title for an account page (the page itself is a client component).
export const metadata: Metadata = {
    title: "My orders",
    robots: { index: false, follow: false },
};

export default function MyOrdersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
