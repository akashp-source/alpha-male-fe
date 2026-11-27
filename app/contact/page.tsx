import type { Metadata } from "next";

import Navbar from "@/Components/Home/NavBar";
import ContactPage from "@/Components/Contact/ContactPage";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Reach the Alpha Male team privately on WhatsApp, phone or email, Monday to Saturday, 10 am to 6 pm IST.",
};

// Public page.
export default function Contact() {
    return (
        <>
            <Navbar />
            <ContactPage />
        </>
    );
}
