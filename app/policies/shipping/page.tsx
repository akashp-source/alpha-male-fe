
import type { Metadata } from "next";

// import FooterPage from "@/Components/Footer"; (replaced by FooterV2 in app/layout.tsx)
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const sections = [
    {
        title: "1. Where We Deliver",
        content: (
            <p>
                We deliver to serviceable PIN codes across India. Enter your PIN code
                on the product page or at checkout to confirm that we deliver to your
                area. We do not ship outside India at present.
            </p>
        ),
    },
    {
        title: "2. Order Processing",
        content: (
            <ul>
                <li>Orders are processed and handed to our courier partner within 24–48 hours of confirmation.</li>
                <li>Orders placed after 5:00 PM IST, or on Sundays and public holidays, are processed from the next working day.</li>
                <li>If a product needs a valid prescription or a verification step, we dispatch it once that step is complete.</li>
                <li>During sales and festive periods, processing may take up to an extra 24 hours. We will let you know if your order is affected.</li>
            </ul>
        ),
    },
    {
        title: "3. Delivery Timelines",
        content: (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#354158] text-olympus">
                                <th className="py-3 pr-4">Destination</th>
                                <th className="py-3">Estimated delivery after dispatch</th>
                            </tr>
                        </thead>
                        <tbody className="text-palladium">
                            <tr className="border-b border-[#28344A]">
                                <td className="py-3 pr-4">Metro cities (Hyderabad, Bengaluru, Mumbai, Delhi NCR, Chennai, Kolkata, Pune)</td>
                                <td className="py-3">2–4 business days</td>
                            </tr>
                            <tr className="border-b border-[#28344A]">
                                <td className="py-3 pr-4">Tier 2 and Tier 3 cities</td>
                                <td className="py-3">3–6 business days</td>
                            </tr>
                            <tr>
                                <td className="py-3 pr-4">Remote areas, North-East states, Jammu & Kashmir, Andaman & Nicobar, Lakshadweep</td>
                                <td className="py-3">6–10 business days</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-4">
                    These timelines are estimates. Weather, local restrictions, strikes
                    or courier disruptions can occasionally cause delays. If your order
                    runs late, we will keep you updated.
                </p>
            </>
        ),
    },
    {
        title: "4. Express Delivery",
        content: (
            <p>
                Need it sooner? Express and priority delivery are available for selected
                PIN codes in major cities. Message or email us before placing your order,
                and we will confirm availability, cost and the expected delivery date.
                Express charges, if any, are added at checkout.
            </p>
        ),
    },
    {
        title: "5. Discreet, Tamper-Proof Packaging",
        content: (
            <>
                <p>Your privacy is built into every parcel:</p>
                <ul>
                    <li><strong>Plain outer packaging:</strong> Nothing on the outside shows the product type or brand category.</li>
                    <li><strong>Neutral shipping label:</strong> The label shows only your name, address and phone number. It carries no product names and no description of the contents.</li>
                    <li><strong>Tamper-evident seal:</strong> Every parcel is securely sealed, so you can see at a glance that it hasn’t been opened.</li>
                    <li><strong>Discreet billing:</strong> Your bank or card statement shows a neutral merchant name.</li>
                    <li><strong>Private communication:</strong> Couriers receive only what they need to deliver your parcel, never details of your order.</li>
                </ul>
            </>
        ),
    },
    {
        title: "6. Shipping Charges",
        content: (
            <p>
                Any shipping charge is shown clearly at checkout, before you pay. There
                are no hidden fees. From time to time we offer free shipping, for example
                on prepaid orders or above a minimum order value. Any current offer is
                shown on the website and at checkout.
            </p>
        ),
    },
    {
        title: "7. Tracking Your Order",
        content: (
            <ul>
                <li>As soon as your order is dispatched, we send a tracking link by SMS, WhatsApp and email.</li>
                <li>You can also track your order at any time under My Orders in your Alpha Male account.</li>
                <li>If your tracking hasn’t updated for more than 48 hours, write to us and we will follow up with the courier for you.</li>
            </ul>
        ),
    },
    {
        title: "8. Delivery Attempts",
        content: (
            <ul>
                <li>Our courier partner will make up to 3 delivery attempts and will call your registered mobile number before each one.</li>
                <li>If you are unavailable, you can ask the courier, or ask us, to reschedule delivery to a convenient day.</li>
                <li>If all attempts fail, the parcel is returned to us. For prepaid orders, we refund the amount you paid, minus any shipping charge. For Cash on Delivery orders, repeated failed deliveries may lead us to withdraw Cash on Delivery for future orders.</li>
            </ul>
        ),
    },
    {
        title: "9. Changing Your Delivery Address",
        content: (
            <p>
                You can change your delivery address or phone number until your order
                is dispatched. Write to us as soon as possible. Once the parcel is with
                the courier, we can no longer change the address.
            </p>
        ),
    },
    {
        title: "10. Receiving Your Parcel",
        content: (
            <ul>
                <li>Before you accept the parcel, check that the seal is intact and the box is undamaged.</li>
                <li>If the parcel looks opened, crushed or tampered with, refuse delivery and contact us right away.</li>
                <li>Please record an unboxing video when you open your parcel. We need it to process any claim for damaged, missing or incorrect items.</li>
                <li>Report any such issue within 48 hours of delivery. We will send a replacement or refund you in full.</li>
            </ul>
        ),
    },
    {
        title: "11. Delays Beyond Our Control",
        content: (
            <p>
                We work with leading courier partners to get every order to you on time.
                We are not responsible for delays caused by events outside our control,
                such as natural disasters, heavy rain, strikes, government restrictions,
                or an incorrect or incomplete address.
            </p>
        ),
    },
    {
        title: "12. Returns",
        content: (
            <p>
                Changed your mind? Sealed, unopened products can be returned within
                7 days of delivery. Opened products cannot be returned, for health and
                hygiene reasons. Our{" "}
                <Link
                    href="/policies/returns"
                    className="text-olympus underline underline-offset-4 hover:text-white"
                >
                    Return & Refund Policy
                </Link>{" "}
                has the full process.
            </p>
        ),
    },
];

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-b border-[#28344A] py-7 last:border-0">
            <h2 className="mb-4 font-heading text-xl text-olympus">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-7 text-palladium [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:text-olympus">
                {children}
            </div>
        </section>
    );
}

function ContactDetails() {
    return (
        <div className="space-y-3 text-sm leading-7 text-palladium">
            <p>
                <strong className="text-olympus">Email:</strong>{" "}
                <a
                    href="mailto:info@alphamale.co.in"
                    className="underline underline-offset-4 hover:text-white"
                >
                    info@alphamale.co.in
                </a>
            </p>
            <p>
                <strong className="text-olympus">Phone / WhatsApp:</strong>{" "}
                <a
                    href="tel:+919000937222"
                    className="underline underline-offset-4 hover:text-white"
                >
                    +91 90009 37222
                </a>
            </p>
            <p>
                <strong className="text-olympus">Support hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM IST
            </p>
            <p>
                <strong className="text-olympus">Address:</strong> Hyderabad, Telangana, India
            </p>
        </div>
    );
}

export const metadata: Metadata = {
    title: "Shipping & Delivery Policy",
    description:
        "Where Alpha Male delivers in India, order processing and delivery timelines, shipping charges and discreet packaging.",
};

export default function ShippingPolicyPage() {
    return (
        <main className="min-h-screen bg-brand-navy text-olympus">
            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">

                {/* Back to Home */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded-full border border-[#354158] px-5 py-2.5 text-sm text-palladium transition-all duration-300 hover:border-olympus hover:bg-[#19243B] hover:text-white"
                    >
                        <span className="transition-transform duration-300 group-hover:-translate-x-1">
                            ←
                        </span>
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-10 border-b border-[#354158] pb-8">
                    <div className="mb-4 flex justify-center">
                        <Link href="/home" aria-label="Alpha Male home">
                            <Image
                                src="/images/logo.png"
                                alt="Alpha Male - Drive, Stamina, Energy"
                                width={150}
                                height={150}
                                priority
                                className="h-[90px] w-[90px] object-contain"
                            />
                        </Link>
                    </div>
                    <h1 className="font-heading text-4xl sm:text-5xl">
                        Shipping & Delivery Policy
                    </h1>
                    <p className="mt-4 text-sm text-[#929BAE]">
                        Effective: 02 November 2026
                    </p>
                    <p className="mt-6 max-w-3xl text-sm leading-7 text-palladium">
                        At Alpha Male, the experience doesn’t end at checkout. Every order
                        is carefully packed, sealed against tampering and delivered
                        discreetly to your door anywhere in India. This policy explains
                        when your order will arrive and how we protect your privacy along
                        the way. It also explains what to do if something doesn’t go to plan.
                    </p>
                </header>

                {/* At a Glance */}
                <section className="mb-8 rounded-xl border border-[#354158] bg-[#19243B]/50 p-6">
                    <h2 className="mb-5 font-heading text-2xl">At a Glance</h2>
                    <div className="space-y-4 text-sm">
                        {[
                            ["When will my order leave?", "Within 24–48 hours of confirmation"],
                            ["How long does delivery take?", "2–4 business days in metro cities, 3–6 in other cities, and up to 10 in remote areas"],
                            ["Will anyone know what’s inside?", "No. Plain, sealed packaging, with no product names on the label"],
                            ["How do I track it?", "A tracking link by SMS, WhatsApp and email as soon as it ships"],
                            ["Is express delivery available?", "Yes, in selected cities. Ask us before ordering"],
                            ["What does shipping cost?", "Any charge is shown clearly at checkout, before you pay"],
                        ].map(([question, answer]) => (
                            <div
                                key={question}
                                className="grid gap-1 border-b border-[#354158] pb-3 last:border-0 sm:grid-cols-2"
                            >
                                <p className="text-olympus">{question}</p>
                                <p className="text-palladium">{answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Policy Sections */}
                <div>
                    {sections.map((section) => (
                        <Section key={section.title} title={section.title}>
                            {section.content}
                        </Section>
                    ))}

                    <Section title="13. Need Help With a Delivery?">
                        <p>Our team is happy to help with anything about your order:</p>
                        <ContactDetails />
                    </Section>
                </div>

                {/* <FooterPage /> replaced by FooterV2 in app/layout.tsx */}
                {/* Footer */}
                {/* <footer className="mt-12 border-t border-[#354158] pt-8 text-center">
                    <p className="font-serif text-sm uppercase tracking-[0.35em] text-olympus">
                        ALPHA MALE
                    </p>
                    <p className="mt-2 text-xs text-[#929BAE]">
                        alphamale.co.in · info@alphamale.co.in
                    </p>
                    <Link
                        href="/"
                        className="mt-5 inline-block text-xs text-[#929BAE] underline underline-offset-4 transition hover:text-white"
                    >
                        ← Back to Home
                    </Link>
                </footer> */}

            </div>
        </main>
    );
}
