
import type { Metadata } from "next";

import FooterPage from "@/Components/Footer";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const sections = [
    {
        title: "1. When You Can Return a Product",
        content: (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-[#354158] text-olympus">
                            <th className="py-3 pr-4">Situation</th>
                            <th className="py-3 pr-4">Report within</th>
                            <th className="py-3">What we do</th>
                        </tr>
                    </thead>
                    <tbody className="text-palladium">
                        {[
                            ["Damaged, leaking or tampered product", "48 hours of delivery", "Free replacement, or a full refund if a replacement isn’t available"],
                            ["Wrong product or missing item", "48 hours of delivery", "We send the correct item free, or refund you in full"],
                            ["Expired product, or under 3 months of shelf life left", "7 days of delivery", "Free replacement or a full refund"],
                            ["Sealed, unopened product (change of mind)", "7 days of delivery", "Refund after inspection, minus the shipping fee"],
                        ].map((row) => (
                            <tr key={row[0]} className="border-b border-[#28344A] last:border-0">
                                {row.map((cell) => (
                                    <td key={cell} className="py-3 pr-4 align-top">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
    },
    {
        title: "2. Return Conditions",
        content: (
            <>
                <p>For a return to be approved, the product must:</p>
                <ul>
                    <li><strong>Be sealed and unused.</strong> The original seal, shrink-wrap and any tamper-evident strip must be intact.</li>
                    <li><strong>Be complete.</strong> Return it in its original pouch or box, with all labels, leaflets and any free items that came with it.</li>
                    <li><strong>Come with proof of purchase.</strong> Your Alpha Male order ID or invoice is enough.</li>
                    <li><strong>Be reported on time.</strong> Raise the request within the time limits in Section 1.</li>
                </ul>
            </>
        ),
    },
    {
        title: "3. Products That Can’t Be Returned",
        content: (
            <>
                <p>To protect every customer’s health, we can’t accept returns of:</p>
                <ul>
                    <li>Opened or used products, even if only partly used. This includes oral strips, condoms, delay sprays, lubricants and wellness pouches.</li>
                    <li>Products without their original seal or packaging.</li>
                    <li>Prescription products, once dispensed, unless they are damaged, wrong or expired.</li>
                    <li>Personalised or custom gift packs, unless they are damaged or wrong.</li>
                    <li>Free gifts and samples.</li>
                    <li>Products bought anywhere other than alphamale.co.in or our authorised partners.</li>
                </ul>
                <p>
                    Products bought on sale, with a coupon or as part of a combo follow
                    the same rules. If you return part of a combo, the refund is calculated
                    on the discounted price you paid.
                </p>
            </>
        ),
    },
    {
        title: "4. How to Raise a Return",
        content: (
            <ol>
                <li><strong>Contact us.</strong> Email info@alphamale.co.in within the time limit, with your order ID, the product name and the reason for the return.</li>
                <li><strong>Share proof for damaged or wrong items.</strong> Attach clear photos and your unedited unboxing video, showing the sealed parcel being opened.</li>
                <li><strong>Get your Return ID.</strong> Our team reviews your request within 48 hours. If it’s approved, we’ll send you a Return ID and pickup details.</li>
                <li><strong>Pack it securely.</strong> Place the product in its original packaging, write your Return ID on a note inside the parcel, and seal it well.</li>
                <li><strong>Hand it over.</strong> We arrange a free reverse pickup wherever it is available. Where it isn’t, we share a prepaid shipping label or the courier details for self-shipping.</li>
            </ol>
        ),
    },
    {
        title: "5. Inspection",
        content: (
            <>
                <p>
                    When your return reaches our warehouse, we inspect it within 3 business
                    days to check that it meets the conditions in Section 2. We will email
                    or message you with the result.
                </p>
                <p>
                    If a product fails inspection, for example because the seal is broken
                    or items are missing, we can’t refund it. We will ship it back to you.
                </p>
            </>
        ),
    },
    {
        title: "6. Damaged or Defective Orders",
        content: (
            <>
                <p>We check every order before it leaves us. If something still arrives damaged or defective:</p>
                <ul>
                    <li>Tell us within 48 hours of delivery, with photos and your unboxing video.</li>
                    <li>Once we confirm the issue, we send a free replacement. If the product is out of stock, we refund you in full.</li>
                    <li>We may ask you to send the item back for quality checks. If so, we arrange the pickup or provide a prepaid label at no cost to you.</li>
                </ul>
            </>
        ),
    },
    {
        title: "7. Refunds",
        content: (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#354158] text-olympus">
                                <th className="py-3 pr-4">How you paid</th>
                                <th className="py-3 pr-4">Where the refund goes</th>
                                <th className="py-3">Timeline after approval</th>
                            </tr>
                        </thead>
                        <tbody className="text-palladium">
                            {[
                                ["UPI, card, net banking or wallet", "Your original payment method", "5–7 business days"],
                                ["Cash on Delivery", "Your bank account or UPI ID, which you share through our secure support link", "5–7 business days"],
                                ["Alpha Male store credit (if you choose it)", "Your Alpha Male account", "Within 24 hours"],
                            ].map((row) => (
                                <tr key={row[0]} className="border-b border-[#28344A] last:border-0">
                                    {row.map((cell) => (
                                        <td key={cell} className="py-3 pr-4 align-top">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4">
                    Your bank may take a few extra days to show the credit. If you haven’t
                    received it within 10 business days of approval, write to us and we
                    will share the transaction reference.
                </p>
            </>
        ),
    },
    {
        title: "8. Special Cases",
        content: (
            <p>
                Some situations don’t fit neatly into a policy. If yours is one of them,
                write to us with the details. We review each case individually and aim
                for an outcome that is fair to you and safe for every customer.
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
            <h2 className="mb-4 font-heading text-xl text-olympus">{title}</h2>
            <div className="space-y-3 text-sm leading-7 text-palladium [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-5 [&_strong]:text-olympus">
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
                <a href="mailto:info@alphamale.co.in" className="underline underline-offset-4 hover:text-white">
                    info@alphamale.co.in
                </a>
            </p>
            <p>
                <strong className="text-olympus">Phone / WhatsApp:</strong>{" "}
                <a href="tel:+919000937222" className="underline underline-offset-4 hover:text-white">
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
    title: "Return & Refund Policy",
    description:
        "When you can return an Alpha Male product, how to report damaged or incorrect items, and how refunds are issued.",
};

export default function ReturnRefundPolicyPage() {
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
                        <Image
                            src="/images/logo.png"
                            alt="Alpha Male - Drive, Stamina, Energy"
                            width={150}
                            height={150}
                            priority
                            unoptimized
                            className="h-[90px] w-[90px] object-contain"
                        />
                    </div>
                    <h1 className="font-heading text-4xl sm:text-5xl">
                        Return & Refund Policy
                    </h1>
                    <p className="mt-4 text-sm text-[#929BAE]">
                        Effective: 02 November 2026
                    </p>
                    <p className="mt-6 max-w-3xl text-sm leading-7 text-palladium">
                        Every Alpha Male product is made to be taken or used on the body,
                        so safety comes first. Only products that have never left their
                        original seal ever go back on our shelves. That is why our returns
                        are strict on hygiene, and quick to put things right when an order
                        arrives damaged or wrong.
                    </p>
                </header>

                {/* At a Glance */}
                <section className="mb-8 rounded-xl border border-[#354158] bg-[#19243B]/50 p-6">
                    <h2 className="mb-5 font-heading text-2xl">At a Glance</h2>
                    <div className="space-y-4 text-sm">
                        {[
                            ["Can I return a product I’ve opened?", "No. Opened or used products can’t be returned, for health and hygiene reasons"],
                            ["Can I return a sealed product if I change my mind?", "Yes, within 7 days of delivery"],
                            ["What if my order arrives damaged or wrong?", "Tell us within 48 hours. We’ll replace it or refund you in full"],
                            ["Do I pay for the return?", "Not for damaged, wrong or expired items. For change-of-mind returns, the shipping fee is deducted from your refund"],
                            ["How soon is my refund?", "5–7 business days after your return is approved"],
                        ].map(([question, answer]) => (
                            <div key={question} className="grid gap-1 border-b border-[#354158] pb-3 last:border-0 sm:grid-cols-2">
                                <p className="text-olympus">{question}</p>
                                <p className="text-palladium">{answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Policy Sections */}
                {sections.map((section) => (
                    <Section key={section.title} title={section.title}>
                        {section.content}
                    </Section>
                ))}

                <Section title="9. Contact Us">
                    <p>For return or refund assistance, contact our team:</p>
                    <ContactDetails />
                </Section>

                <FooterPage />
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
