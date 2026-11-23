import type { Metadata } from "next";

// Neutral tab title for an account page (the page itself is a client component).
export const metadata: Metadata = {
    title: "Help & support",
    robots: { index: false, follow: false },
};

export default function AccountSupportLayout({ children }: { children: React.ReactNode }) {
    return children;
}
