import type { Metadata } from "next";

import Navbar from "@/Components/Home/NavBar";
import HelpCenter from "@/Components/Help/HelpCenter";
import FooterPage from "@/Components/Footer";

export const metadata: Metadata = {
    title: "Help & Support",
    description:
        "Answers on orders, tracking, discreet delivery, payments, returns and using Alpha Male products, plus ways to reach our team.",
};

// Public page: no sign-in required.
export default function HelpPage() {
    return (
        <>
            <Navbar />
            <HelpCenter />
            <FooterPage />
        </>
    );
}
