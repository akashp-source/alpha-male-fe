import type { Metadata } from "next";

// Neutral tab title for an account page (the page itself is a client component).
export const metadata: Metadata = {
    title: "My profile",
    robots: { index: false, follow: false },
};

export default function MyProfileLayout({ children }: { children: React.ReactNode }) {
    return children;
}
