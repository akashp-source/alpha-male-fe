import type { Metadata } from "next";

// Neutral tab title for an account page (the page itself is a client component).
export const metadata: Metadata = {
    title: "Saved addresses",
    robots: { index: false, follow: false },
};

export default function SavedAddressesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
